<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '000000000000000');
fbq('track', 'PageView');

/* ===== AddToCart - Category and Product Page ===== */
(function(){
  function parseEuroPrice(txt) {
    if (!txt) return null;
    txt = txt.replace(/\u00A0/g, ' ').replace('€','').trim();
    txt = txt.replace(/\./g,'').replace(',', '.');
    const v = parseFloat(txt);
    return Number.isFinite(v) ? v : null;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target?.closest?.('button');
    if (!btn) return;
    
    const btnText = (btn.textContent || '').trim().toLowerCase();
    if (!btnText.includes('aggiungi al carrello')) return;
    
    let wrapper = btn.closest('commerce-action-button[data-product-id]');
    if (wrapper) {
      const productId = wrapper.getAttribute('data-product-id');
      const aria = btn.getAttribute('aria-label') || '';
      const productName = aria.includes(':')
        ? aria.split(':').slice(1).join(':').trim()
        : aria.trim();
      
      const tile = wrapper.closest('li, article, section, div');
      const priceNode = tile?.querySelector('commerce-product-pricing lightning-formatted-number');
      const value = parseEuroPrice(priceNode?.textContent || '');
      
      if (window.fbq) {
        const eventID = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        window.fbq('track', 'AddToCart', {
          content_type: 'product',
          content_ids: [productId],
          content_name: productName,
          currency: 'EUR',
          value: value,
          contents: [{ id: productId, quantity: 1, item_price: value }]
        }, { eventID });
      }
      return;
    }
    
    const pdpWrapper = btn.closest('commerce_product_details-add-quantity, commerce_builder-purchase-options');
    if (pdpWrapper) {
      const productNameEl = document.querySelector('commerce_product_details-heading h1');
      const productName = productNameEl?.textContent?.trim();
	  const skuEl = document.querySelector('commerce-field-display lightning-formatted-rich-text')?.shadowRoot?.querySelector('span');
	  const productSku = skuEl?.textContent?.trim();
      const urlParts = window.location.pathname.split('/');
      const productId = urlParts[urlParts.length - 1];
	  const priceEl = document.querySelector('lightning-formatted-number[data-automation="productPricingMainPrice"]');
      const value = parseEuroPrice(priceEl?.shadowRoot?.textContent || priceEl?.innerText || '');
      const qtyInput = pdpWrapper.querySelector('.number-input__input');
      const quantity = parseInt(qtyInput?.value) || 1;
      
      if (window.fbq && productId) {
        const eventID = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
        window.fbq('track', 'AddToCart', {
          content_type: 'product',
          content_ids: [productSku || productId],
          content_name: productName,
          currency: 'EUR',
          value: value ? (value * quantity).toFixed(2) : null,
          contents: [{ id: productSku || productId, quantity: quantity, item_price: value }]
        }, { eventID });
      }
    }
  }, true);
})();
/* ===== END AddToCart ===== */

/* ===== ViewContent - Product Detail Page ===== */
(function(){
  let tracked = false;
  let lastProductId = '';
  
  function parseEuroPrice(txt) {
    if (!txt) return null;
    txt = txt.replace(/\u00A0/g, ' ').replace('€','').trim();
    txt = txt.replace(/\./g,'').replace(',', '.');
    const v = parseFloat(txt);
    return Number.isFinite(v) ? v : null;
  }
  
  const trackViewContent = () => {
    const isProductPage = window.location.pathname.includes('/product/');
    if (!isProductPage) return;
    
    const urlParts = window.location.pathname.split('/');
    const productId = urlParts[urlParts.length - 1];
    
    if (productId !== lastProductId) {
      tracked = false;
      lastProductId = productId;
    }
    if (tracked) return;
    
    const productNameEl = document.querySelector('commerce_product_details-heading h1');
    const productName = productNameEl?.textContent?.trim();
    const skuEl = document.querySelector('commerce-field-display lightning-formatted-rich-text')?.shadowRoot?.querySelector('span');
	const productSku = skuEl?.textContent?.trim();
	const priceEl = document.querySelector('lightning-formatted-number[data-automation="productPricingMainPrice"]');
	const value = parseEuroPrice(priceEl?.shadowRoot?.textContent || priceEl?.innerText || '');
    
    if (!productName || !productId) return;
    
    if (window.fbq) {
      const eventID = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      window.fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids: [productSku || productId],
        content_name: productName,
        currency: 'EUR',
        value: value,
        contents: [{ id: productSku || productId, quantity: 1, item_price: value }]
      }, { eventID });
      tracked = true;
    }
  };
  
  setInterval(trackViewContent, 1000);
  setTimeout(trackViewContent, 1000);
})();
/* ===== END ViewContent ===== */

/* ===== InitiateCheckout - Checkout Page ===== */
(function(){
  let tracked = false;
  let lastUrl = '';
  
  function parseEuroPrice(txt) {
    if (!txt) return null;
    txt = txt.replace(/\u00A0/g, ' ').replace('€','').trim();
    txt = txt.replace(/\./g,'').replace(',', '.');
    const v = parseFloat(txt);
    return Number.isFinite(v) ? v : null;
  }
  
  const trackInitiateCheckout = () => {
    const currentUrl = window.location.pathname;
    if (currentUrl !== lastUrl) {
      tracked = false;
      lastUrl = currentUrl;
    }
    
    const isCheckoutPage = currentUrl.includes('/checkout');
    if (!isCheckoutPage || tracked) return;
    if (!window.fbq) return;
    
    const cartItems = document.querySelectorAll('commerce_cart-item');
    if (!cartItems || cartItems.length === 0) return;
    
    const contentIds = [];
    const contents = [];
    let totalValue = 0;
    let totalQuantity = 0;
    
    cartItems.forEach(item => {
      const nameEl = item.querySelector('dxp_base-text-block p');
      const fullText = nameEl?.textContent?.trim() || '';
      const match = fullText.match(/^(.+?)\s*\((\d+)\)$/);
      const quantity = match ? parseInt(match[2]) : 1;
      const link = item.querySelector('a[href*="/product/detail/"]');
      const productId = link?.href?.split('/').pop();
      const priceEl = item.querySelector('.item-prices .actualPrice span:last-child');
      const totalPrice = parseEuroPrice(priceEl?.textContent || '');
      const unitPrice = totalPrice ? (totalPrice / quantity) : null;
      
      if (productId) {
        contentIds.push(productId);
        contents.push({ id: productId, quantity: quantity, item_price: unitPrice ? parseFloat(unitPrice.toFixed(2)) : null });
        if (totalPrice) totalValue += totalPrice;
        totalQuantity += quantity;
      }
    });
    
    if (contentIds.length === 0) return;
    
    const eventID = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
    window.fbq('track', 'InitiateCheckout', {
      content_type: 'product',
      content_ids: contentIds,
      currency: 'EUR',
      value: totalValue.toFixed(2),
      num_items: totalQuantity,
      contents: contents
    }, { eventID });
    tracked = true;
  };
  
  setInterval(trackInitiateCheckout, 1000);
  [500, 1000, 2000].forEach(d => setTimeout(trackInitiateCheckout, d));
})();
/* ===== END InitiateCheckout ===== */

/* ===== Purchase - Order Confirmation ===== */
(function(){
  let tracked = false;
  let lastOrderNumber = '';

  function parseEuroPrice(txt) {
    if (!txt) return null;
    txt = txt.replace(/\u00A0/g, ' ').replace('€','').trim();
    txt = txt.replace(/\./g,'').replace(',', '.');
    const v = parseFloat(txt);
    return Number.isFinite(v) && v > 0 ? v : null;
  }

  function getPriceText(el) {
    if (el.shadowRoot) return el.shadowRoot.textContent || '';
    return el.innerText || el.textContent || '';
  }

  function getOrderNumber() {
    try {
      return new URLSearchParams(window.location.search).get('orderNumber') || '';
    } catch(e) { return ''; }
  }

  const trackPurchase = () => {
    /* Reset if different order */
    const orderNum = getOrderNumber();
    if (orderNum && orderNum !== lastOrderNumber) {
      tracked = false;
      lastOrderNumber = orderNum;
    }
    if (tracked) return;

    /* Prevent duplicate tracking for same order */
    if (orderNum) {
      try {
        if (sessionStorage.getItem('meta_purchase_' + orderNum) === 'true') {
          tracked = true;
          return;
        }
      } catch(e) {}
    }

    if (!document.querySelector('commerce_builder-order-confirmation-success-message')) return;
    if (!window.fbq) return;

    let totalValue = null;
    const totalsContainer = document.querySelector('commerce_builder-order-confirmation-totals-summary');
    if (totalsContainer) {
      const allPrices = totalsContainer.querySelectorAll('lightning-formatted-number');
      if (allPrices.length > 0) {
        totalValue = parseEuroPrice(getPriceText(allPrices[allPrices.length - 1]));
      }
    }
    if (!totalValue) {
      const allPrices = document.querySelectorAll('lightning-formatted-number');
      if (allPrices.length > 0) {
        totalValue = parseEuroPrice(getPriceText(allPrices[allPrices.length - 1]));
      }
    }
    if (!totalValue) return;

    totalValue = Math.round(totalValue * 100) / 100;

    const eventID = crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

    window.fbq('track', 'Purchase', {
      content_type: 'product',
      currency: 'EUR',
      value: totalValue
    }, { eventID });

    tracked = true;
    if (orderNum) {
      try { sessionStorage.setItem('meta_purchase_' + orderNum, 'true'); } catch(e) {}
    }
  };

  /* setInterval like the other working events */
  setInterval(trackPurchase, 1000);
  [500, 1000, 2000, 4000].forEach(d => setTimeout(trackPurchase, d));
})();
/* ===== END Purchase ===== */
</script>
<!-- End Meta Pixel Code -->