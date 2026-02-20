<!-- Meta Pixel – Adaptive Salesforce Commerce B2B -->
<script>
/**
 * ============================================================
 *  META PIXEL – ADAPTIVE SCRIPT FOR SALESFORCE COMMERCE B2B
 * ============================================================
 *  Version    : 2.0.0
 *  Author     : alteavane (https://github.com/alteavane)
 *  Repository : https://github.com/alteavane/meta-pixel-sfcc
 *  License    : MIT
 *  Platform   : Salesforce Commerce Cloud B2B (LWR / Aura)
 *  Events     : PageView · ViewContent · AddToCart
 *               InitiateCheckout · Purchase
 *
 *  ▸ Automatic Shadow DOM traversal
 *  ▸ Selector chains with fallbacks
 *  ▸ Automatic currency detection
 *  ▸ Anti-duplication with eventID + sessionStorage
 *  ▸ Debug logging activatable from console
 *
 *  CONFIGURATION: Only modify the PIXEL_ID line below.
 * ============================================================
 */

(function () {
  'use strict';

  /* ──────────────── CONFIGURATION ──────────────── */
  const PIXEL_ID = '000000000000000';   // ← Insert your Pixel ID here
  const POLL_MS  = 1000;                // Polling interval (ms)
  const DEBUG    = false;               // true → console logs (also activatable with: window.__META_DEBUG = true)
  /* ────────────────────────────────────────────────── */


  /* ================================================
   *  0. UTILITIES
   * ================================================ */

  /** Conditional logger */
  const log = (...args) => {
    if (DEBUG || window.__META_DEBUG) console.log('[MetaPixel]', ...args);
  };

  /** Generates a unique eventID */
  const makeEventID = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });

  /**
   * Deep querySelector — automatically traverses Shadow DOM boundaries.
   * Accepts a single CSS selector or an array of selectors (fallback chain).
   * Returns the first element found or null.
   */
  function deepQuery(selectors, root) {
    if (!Array.isArray(selectors)) selectors = [selectors];
    root = root || document;

    for (const sel of selectors) {
      // 1. Direct attempt (light DOM)
      let el = root.querySelector(sel);
      if (el) return el;

      // 2. Attempt traversing each shadowRoot in the page
      const hosts = root.querySelectorAll('*');
      for (const host of hosts) {
        if (host.shadowRoot) {
          el = host.shadowRoot.querySelector(sel);
          if (el) return el;
        }
      }
    }
    return null;
  }

  /**
   * Deep querySelectorAll — like deepQuery but returns ALL elements.
   * Automatically traverses Shadow DOM boundaries.
   */
  function deepQueryAll(selectors, root) {
    if (!Array.isArray(selectors)) selectors = [selectors];
    root = root || document;

    for (const sel of selectors) {
      // 1. Direct attempt (light DOM)
      let els = root.querySelectorAll(sel);
      if (els && els.length > 0) return els;

      // 2. Attempt traversing each shadowRoot
      const hosts = root.querySelectorAll('*');
      for (const host of hosts) {
        if (host.shadowRoot) {
          els = host.shadowRoot.querySelectorAll(sel);
          if (els && els.length > 0) return els;
        }
      }
    }
    return [];
  }

  /**
   * Reads text from an element, traversing shadowRoot if necessary.
   */
  function readText(el) {
    if (!el) return '';
    const t = el.innerText || el.textContent || '';
    if (t.trim()) return t.trim();
    if (el.shadowRoot) {
      return (el.shadowRoot.textContent || '').trim();
    }
    return '';
  }

  /**
   * Searches for an element with fallback chain and returns its text.
   */
  function findText(selectors, root) {
    const el = deepQuery(selectors, root);
    return readText(el);
  }

  /**
   * Multi-format price parsing: 1.234,56 / 1,234.56 / 1234.56 / 1234,56
   */
  function parsePrice(txt) {
    if (!txt) return null;
    // Remove currency symbols and spaces
    txt = txt.replace(/[^\d.,-]/g, '').trim();
    if (!txt) return null;

    // European format: 1.234,56 → remove dots, comma → dot
    if (/\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(txt)) {
      txt = txt.replace(/\./g, '').replace(',', '.');
    }
    // Format 1234,56 (no thousand separator)
    else if (/^\d+(,\d{1,2})$/.test(txt)) {
      txt = txt.replace(',', '.');
    }
    // US format: 1,234.56 → remove commas
    else if (/\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(txt)) {
      txt = txt.replace(/,/g, '');
    }

    const v = parseFloat(txt);
    return Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
  }

  /**
   * Detects currency from page via symbol or ISO code.
   */
  function detectCurrency() {
    const currencyMap = {
      '€': 'EUR', '$': 'USD', '£': 'GBP', '¥': 'JPY',
      '₹': 'INR', '₽': 'RUB', '₺': 'TRY', '₩': 'KRW',
      'zł': 'PLN', 'kr': 'SEK', 'Fr': 'CHF', 'R$': 'BRL',
    };
    const isoCodes = ['EUR','USD','GBP','JPY','CNY','INR','CHF','CAD','AUD','SEK','NOK','DKK','PLN','CZK','HUF','RON','BGN','HRK','TRY','BRL','MXN','ARS','CLP','COP','PEN','KRW','SGD','MYR','THB','IDR','PHP','VND','AED','SAR','ZAR','NGN','EGP','ILS','RUB','UAH','KZT','GEL'];

    // Search in visible prices
    const priceSelectors = [
      'lightning-formatted-number',
      '[data-automation*="Price"]',
      '[data-automation*="price"]',
      '.main-price',
      '.actualPrice',
      'commerce-product-pricing',
      'commerce-product-pricing-details',
    ];

    for (const sel of priceSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const txt = readText(el);
        if (!txt) continue;

        // Search for symbol
        for (const [symbol, code] of Object.entries(currencyMap)) {
          if (txt.includes(symbol)) return code;
        }
        // Search for ISO code
        for (const code of isoCodes) {
          if (txt.includes(code)) return code;
        }
      }
    }

    // Fallback: meta tag or lang attribute
    const currencyMeta = document.querySelector('meta[name="currency"], meta[property="og:price:currency"]');
    if (currencyMeta) return currencyMeta.content?.trim() || 'EUR';

    return 'EUR'; // default
  }

  /**
   * Anti-duplication for orders (sessionStorage)
   */
  function isOrderTracked(orderNum) {
    if (!orderNum) return false;
    try { return sessionStorage.getItem('meta_purchase_' + orderNum) === 'true'; }
    catch (e) { return false; }
  }
  function markOrderTracked(orderNum) {
    if (!orderNum) return;
    try { sessionStorage.setItem('meta_purchase_' + orderNum, 'true'); }
    catch (e) { /* silenzioso */ }
  }


  /* ================================================
   *  1. INIT META PIXEL (base)
   * ================================================ */

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
  n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
  s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  log('Pixel initialized – ID:', PIXEL_ID);


  /* ================================================
   *  2. SELETTORI CON FALLBACK
   *     Ogni array è una catena: si prova il primo,
   *     poi il secondo, ecc. fino a trovare un match.
   * ================================================ */

  const SEL = {

    /* ── Product Detail Page (PDP) ── */
    pdp: {
      name: [
        'commerce_product_details-heading h1',
        'h1[data-automation="productName"]',
        '.product-name h1',
        'h1',
      ],
      sku: [
        'commerce-field-display lightning-formatted-rich-text span',
        '[field-name="StockKeepingUnit"] span',
        '[field-name="SKU"] span',
        '[data-automation="productSku"]',
      ],
      price: [
        'lightning-formatted-number[data-automation="productPricingMainPrice"]',
        'commerce-product-pricing-details .main-price lightning-formatted-number',
        'commerce-product-pricing-details lightning-formatted-number',
        'commerce_product_details-pricing lightning-formatted-number',
        '.product-price lightning-formatted-number',
      ],
      addToCartBtn: [
        'commerce_product_details-add-quantity',
        'commerce_builder-purchase-options',
      ],
      quantity: [
        '.number-input__input',
        'input[type="number"]',
      ],
    },

    /* ── Product Tile (list / category) ── */
    tile: {
      wrapper: 'commerce-action-button[data-product-id]',
      price: [
        'commerce-product-pricing lightning-formatted-number',
        'lightning-formatted-number',
      ],
    },

    /* ── Checkout ── */
    checkout: {
      cartItem: [
        'commerce_cart-item',
        'commerce-cart-item',
      ],
      itemName: [
        'dxp_base-text-block p',
        '.item-name',
        'a[href*="/product/"] span',
      ],
      itemLink: [
        'a[href*="/product/detail/"]',
        'a[href*="/product/"]',
      ],
      itemPrice: [
        '.actualPrice span:not(.slds-assistive-text)',
        '.item-prices .actualPrice span:last-child',
        '.item-prices lightning-formatted-number',
        'lightning-formatted-number',
      ],
    },

    /* ── Order Confirmation ── */
    purchase: {
      successMessage: [
        'commerce_builder-order-confirmation-success-message',
        '[data-automation="orderConfirmation"]',
      ],
      totals: [
        'commerce_builder-order-confirmation-totals-summary lightning-formatted-number',
        'commerce_builder-order-confirmation-totals-summary',
      ],
    },
  };


  /* ================================================
   *  3. EVENT TRACKERS
   * ================================================ */

  /* ── 3a. ViewContent (PDP) ── */
  (function () {
    let lastProductId = '';
    let tracked = false;

    const track = () => {
      if (!window.location.pathname.includes('/product/')) return;

      const urlParts = window.location.pathname.split('/');
      const productId = urlParts[urlParts.length - 1];
      if (productId !== lastProductId) { tracked = false; lastProductId = productId; }
      if (tracked) return;

      const productName = findText(SEL.pdp.name);
      if (!productName || !productId) return;

      const productSku = findText(SEL.pdp.sku);
      const priceText  = findText(SEL.pdp.price);
      const value      = parsePrice(priceText);
      const currency   = detectCurrency();

      const eventID = makeEventID();
      const contentId = productSku || productId;

      fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids:  [contentId],
        content_name: productName,
        currency:     currency,
        value:        value,
        contents:     [{ id: contentId, quantity: 1, item_price: value }],
      }, { eventID });

      tracked = true;
      log('ViewContent ✓', { contentId, productName, value, currency, eventID });
    };

    setInterval(track, POLL_MS);
    setTimeout(track, 500);
  })();


  /* ── 3b. AddToCart ── */
  (function () {
    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button');
      if (!btn) return;

      const btnText = (btn.textContent || '').trim().toLowerCase();
      // Multi-language button support
      const addToCartKeywords = ['aggiungi al carrello', 'add to cart', 'add to basket', 'ajouter au panier', 'in den warenkorb', 'añadir al carrito'];
      if (!addToCartKeywords.some(kw => btnText.includes(kw))) return;

      const currency = detectCurrency();

      /* ── Case A: product tile (list/category) ── */
      const tileWrapper = btn.closest(SEL.tile.wrapper);
      if (tileWrapper) {
        const productId   = tileWrapper.getAttribute('data-product-id');
        const aria        = btn.getAttribute('aria-label') || '';
        const productName = aria.includes(':') ? aria.split(':').slice(1).join(':').trim() : aria.trim();
        const tile        = tileWrapper.closest('li, article, section, div');
        const priceText   = findText(SEL.tile.price, tile);
        const value       = parsePrice(priceText);

        const eventID = makeEventID();
        fbq('track', 'AddToCart', {
          content_type: 'product',
          content_ids:  [productId],
          content_name: productName,
          currency:     currency,
          value:        value,
          contents:     [{ id: productId, quantity: 1, item_price: value }],
        }, { eventID });

        log('AddToCart (tile) ✓', { productId, productName, value, eventID });
        return;
      }

      /* ── Case B: product detail page (PDP) ── */
      let pdpWrapper = null;
      for (const sel of SEL.pdp.addToCartBtn) {
        pdpWrapper = btn.closest(sel);
        if (pdpWrapper) break;
      }
      if (!pdpWrapper) return;

      const productName = findText(SEL.pdp.name);
      const productSku  = findText(SEL.pdp.sku);
      const urlParts    = window.location.pathname.split('/');
      const productId   = urlParts[urlParts.length - 1];
      const priceText   = findText(SEL.pdp.price);
      const value       = parsePrice(priceText);

      const qtyEl    = deepQuery(SEL.pdp.quantity, pdpWrapper);
      const quantity = parseInt(qtyEl?.value) || 1;
      const contentId = productSku || productId;

      const eventID = makeEventID();
      fbq('track', 'AddToCart', {
        content_type: 'product',
        content_ids:  [contentId],
        content_name: productName,
        currency:     currency,
        value:        value ? parseFloat((value * quantity).toFixed(2)) : null,
        contents:     [{ id: contentId, quantity: quantity, item_price: value }],
      }, { eventID });

      log('AddToCart (PDP) ✓', { contentId, productName, value, quantity, eventID });
    }, true);
  })();


  /* ── 3c. InitiateCheckout ── */
  (function () {
    let tracked = false;
    let lastUrl = '';

    const track = () => {
      const currentUrl = window.location.pathname;
      if (currentUrl !== lastUrl) {
        tracked = false;
        lastUrl = currentUrl;
        log('InitiateCheckout: URL changed →', currentUrl);
      }

      if (!currentUrl.includes('/checkout')) return;
      if (tracked) return;

      // Verify presence of checkout components (more robust than searching for cart items)
      const checkoutIndicators = [
        'commerce_builder-checkout-contact-info',
        'commerce_data_provider-checkout-data-provider',
        'commerce_builder-checkout-payment',
        'commerce_builder-checkout-delivery',
        'commerce_cart-checkout-button',
      ];

      let checkoutComponentFound = false;
      for (const selector of checkoutIndicators) {
        if (document.querySelector(selector)) {
          checkoutComponentFound = true;
          log('InitiateCheckout: found checkout component:', selector);
          break;
        }
      }

      if (!checkoutComponentFound) {
        log('InitiateCheckout: no checkout component found, skip');
        return;
      }

      // Attempt to retrieve product data (optional)
      const cartItems = document.querySelectorAll('commerce_cart-item');
      log('InitiateCheckout: found', cartItems.length, 'cart items');

      const currency    = detectCurrency();
      const contentIds  = [];
      const contents    = [];
      let totalValue    = 0;
      let totalQuantity = 0;

      // If cart items are present, collect data
      if (cartItems && cartItems.length > 0) {
        cartItems.forEach((item, index) => {
          // Product name with quantity: "Product Name (2)"
          const nameEl = item.querySelector('dxp_base-text-block p');
          const fullText = nameEl?.textContent?.trim() || '';
          const match = fullText.match(/^(.+?)\s*\((\d+)\)$/);
          const quantity = match ? parseInt(match[2]) : 1;

          // Product ID from link
          const link = item.querySelector('a[href*="/product/detail/"]');
          const productId = link?.href?.split('/').pop();

          // Total item price (already multiplied by quantity)
          const priceEl = item.querySelector('.item-prices .actualPrice span:last-child');
          const priceText = priceEl?.textContent?.trim() || '';
          const totalPrice = parsePrice(priceText);
          const unitPrice = totalPrice ? parseFloat((totalPrice / quantity).toFixed(2)) : null;

          log('InitiateCheckout item', index, ':', { productId, fullText, quantity, priceText, totalPrice, unitPrice });

          if (productId) {
            contentIds.push(productId);
            contents.push({ id: productId, quantity: quantity, item_price: unitPrice });
            if (totalPrice) totalValue += totalPrice;
            totalQuantity += quantity;
          } else {
            log('InitiateCheckout: productId not found for item', index);
          }
        });
      }

      // Send event ALWAYS (even without product data)
      const eventID = makeEventID();
      const eventData = {
        content_type: 'product',
        currency:     currency,
      };

      // Add product data only if available
      if (contentIds.length > 0) {
        eventData.content_ids = contentIds;
        eventData.value = parseFloat(totalValue.toFixed(2));
        eventData.num_items = totalQuantity;
        eventData.contents = contents;
      }

      fbq('track', 'InitiateCheckout', eventData, { eventID });

      tracked = true;
      log('InitiateCheckout ✓', { contentIds: contentIds.length > 0 ? contentIds : 'N/A', totalValue: totalValue || 'N/A', totalQuantity: totalQuantity || 'N/A', eventID });
    };

    setInterval(track, POLL_MS);
    [500, 1000, 2000, 3000, 4000].forEach(d => setTimeout(track, d));
  })();


  /* ── 3d. Purchase ── */
  (function () {
    let tracked = false;
    let lastOrderNumber = '';

    function getOrderNumber() {
      try { return new URLSearchParams(window.location.search).get('orderNumber') || ''; }
      catch (e) { return ''; }
    }

    const track = () => {
      const orderNum = getOrderNumber();
      if (orderNum && orderNum !== lastOrderNumber) { tracked = false; lastOrderNumber = orderNum; }
      if (tracked) return;
      if (orderNum && isOrderTracked(orderNum)) { tracked = true; return; }

      // Verify confirmation page
      let confirmFound = false;
      for (const sel of SEL.purchase.successMessage) {
        if (document.querySelector(sel)) { confirmFound = true; break; }
      }
      if (!confirmFound) return;

      // Find the total
      let totalValue = null;

      // Strategy 1: totals in order summary area
      for (const sel of SEL.purchase.totals) {
        const els = document.querySelectorAll(sel);
        if (els && els.length > 0) {
          // The last lightning-formatted-number is typically the grand total
          const lastEl = els[els.length - 1];
          totalValue = parsePrice(readText(lastEl));
          if (totalValue) break;
        }
      }

      // Strategy 2: fallback to all lightning-formatted-number
      if (!totalValue) {
        const allPrices = document.querySelectorAll('lightning-formatted-number');
        if (allPrices.length > 0) {
          totalValue = parsePrice(readText(allPrices[allPrices.length - 1]));
        }
      }

      if (!totalValue) return;

      const currency = detectCurrency();
      const eventID  = makeEventID();

      fbq('track', 'Purchase', {
        content_type: 'product',
        currency:     currency,
        value:        totalValue,
      }, { eventID });

      tracked = true;
      markOrderTracked(orderNum);
      log('Purchase ✓', { orderNum, totalValue, currency, eventID });
    };

    setInterval(track, POLL_MS);
    [500, 1000, 2000, 4000].forEach(d => setTimeout(track, d));
  })();


  /* ================================================
   *  4. SPA NAVIGATION – Reset tracking on URL change
   * ================================================ */
  (function () {
    let currentPath = window.location.pathname;

    // Intercept pushState / replaceState (Salesforce LWR SPA navigation)
    const originalPush    = history.pushState;
    const originalReplace = history.replaceState;

    history.pushState = function () {
      originalPush.apply(this, arguments);
      onUrlChange();
    };
    history.replaceState = function () {
      originalReplace.apply(this, arguments);
      onUrlChange();
    };
    window.addEventListener('popstate', onUrlChange);

    function onUrlChange() {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        currentPath = newPath;
        log('URL changed →', newPath);
        // PageView on every SPA navigation
        fbq('track', 'PageView');
      }
    }
  })();

  log('Script loaded. To enable debug: window.__META_DEBUG = true');
})();
</script>
<!-- End Meta Pixel – Adaptive Salesforce Commerce B2B -->
