# Meta Pixel for Salesforce Commerce Cloud B2B

> 🚀 **Production-ready Meta Pixel implementation for Salesforce Commerce Cloud B2B (LWR/LWC)**
> Solves Shadow DOM traversal, async rendering, and SPA navigation challenges out of the box.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Salesforce Commerce Cloud](https://img.shields.io/badge/Salesforce-B2B_Commerce-00A1E0?logo=salesforce)](https://www.salesforce.com/products/commerce-cloud/b2b-ecommerce/)
[![Meta Pixel](https://img.shields.io/badge/Meta-Pixel_Tracking-0668E1?logo=meta)](https://developers.facebook.com/docs/meta-pixel)

---

## 📋 Table of Contents

- [Why This Script?](#-why-this-script)
- [Features](#-features)
- [Installation](#-installation)
- [Tracked Events](#-tracked-events)
- [Configuration](#-configuration)
  - [Basic Setup](#basic-setup)
  - [Checkout Configuration](#checkout-configuration)
  - [Custom Selectors](#custom-selectors)
- [Debug Mode](#-debug-mode)
- [Troubleshooting](#-troubleshooting)
- [Architecture](#-architecture)
- [Browser Compatibility](#-browser-compatibility)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Why This Script?

Salesforce Commerce Cloud B2B (Lightning Web Runtime) uses **Lightning Web Components (LWC)** with **Shadow DOM encapsulation**, making traditional Meta Pixel implementations fail silently. Standard `querySelector` cannot access elements inside Shadow DOM boundaries, and the async rendering of LWC requires careful timing strategies.

**This script solves:**
- ✅ Shadow DOM traversal (automatic `shadowRoot` detection)
- ✅ Async component rendering (polling + multiple timeouts)
- ✅ SPA navigation tracking (`pushState`/`replaceState` interception)
- ✅ Multi-currency detection (automatic from page content)
- ✅ Multi-format price parsing (`1.234,56` / `1,234.56` / etc.)
- ✅ Event deduplication (unique `eventID` + `sessionStorage`)

**There is currently no official Salesforce plugin for Meta Pixel on B2B Commerce.**
This open-source solution fills that gap.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Shadow DOM Traversal** | Automatically pierces Shadow DOM boundaries in LWC components |
| **Selector Fallback Chains** | Each element is searched with multiple alternative selectors |
| **Multi-Currency Support** | Auto-detects currency from page (€, $, £, ¥, etc.) - supports 40+ currencies |
| **Multi-Format Prices** | Parses `1.234,56` / `1,234.56` / `1234.56` / `1234,56` automatically |
| **SPA Navigation** | Intercepts `pushState`/`replaceState` for Lightning Web Runtime routing |
| **Event Deduplication** | Unique `eventID` + `sessionStorage` prevents duplicate Purchase events |
| **Multi-Language** | Recognizes "Add to Cart" button in 6 languages |
| **Debug Mode** | Activatable from console without code changes |
| **Zero Dependencies** | Pure JavaScript, no external libraries required |

---

## 📦 Installation

### Step 1: Get Your Pixel ID

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Copy the Pixel ID (15-digit number)

### Step 2: Configure the Script

1. Open `meta-pixel-sfcc.js`
2. Replace `'000000000000000'` with your actual Pixel ID:

```javascript
const PIXEL_ID = '000000000000000';  // ← Your Pixel ID here
```

### Step 3: Install in Experience Builder

1. In Salesforce, navigate to your **B2B Commerce store**
2. Open **Experience Builder** (Digital Experiences → Builder)
3. Click **⚙️ Settings** (top right)
4. Go to **Advanced** → **Head Markup**
5. Paste the **entire content** of `meta-pixel-sfcc.js` (including `<script>` tags)
6. Click **Publish**

![Experience Builder Head Markup Location](https://via.placeholder.com/800x200.png?text=Settings+%E2%86%92+Advanced+%E2%86%92+Head+Markup)

> ⚠️ **Important:** The script must be placed in the `<head>` section to load before page content.

---

## 📊 Tracked Events

| Event | Trigger | Required Data | Optional Data |
|-------|---------|---------------|---------------|
| **PageView** | Every page load + SPA navigation | – | – |
| **ViewContent** | Product detail page (`/product/`) | `content_ids`, `content_name` | `value`, `currency` |
| **AddToCart** | Click "Add to Cart" (PDP + tiles) | `content_ids`, `content_name` | `value`, `quantity`, `currency` |
| **InitiateCheckout** | Checkout page (`/checkout`) | – | `content_ids`, `value`, `num_items`, `currency` |
| **Purchase** | Order confirmation page | `value`, `currency` | `content_ids` |

### Event Details

#### 🛍️ ViewContent
Fires when a user views a product detail page.

**Tracked data:**
- Product ID / SKU
- Product name
- Price (if available)
- Currency

#### 🛒 AddToCart
Fires when user clicks "Add to Cart" button (works on both product tiles and detail pages).

**Tracked data:**
- Product ID / SKU
- Product name
- Unit price
- Quantity
- Total value
- Currency

**Multi-language button detection:**
- 🇮🇹 "Aggiungi al carrello"
- 🇬🇧 "Add to cart"
- 🇫🇷 "Ajouter au panier"
- 🇩🇪 "In den Warenkorb"
- 🇪🇸 "Añadir al carrito"

#### 💳 InitiateCheckout
Fires when user lands on the checkout page.

**Trigger mechanism:**
The script detects checkout pages by verifying the presence of specific LWC components:
- `commerce_builder-checkout-contact-info`
- `commerce_data_provider-checkout-data-provider`
- `commerce_builder-checkout-payment`
- `commerce_builder-checkout-delivery`
- `commerce_cart-checkout-button`

**Tracked data (when available):**
- Product IDs (from cart items)
- Total value
- Number of items
- Currency

> 💡 **Note:** If cart items are not visible on the checkout page (due to custom layouts), the event will still fire with minimal data. See [Checkout Configuration](#checkout-configuration) for details.

#### ✅ Purchase
Fires on the order confirmation page.

**Tracked data:**
- Order total
- Currency
- Order number (for deduplication)

**Deduplication:**
Uses `sessionStorage` to prevent duplicate events if the user refreshes the confirmation page.

---

## ⚙️ Configuration

### Basic Setup

The script works **out of the box** with default Salesforce B2B Commerce configurations. No additional setup required.

**Default configuration:**
```javascript
const PIXEL_ID = 'YOUR_PIXEL_ID';  // Required
const POLL_MS  = 1000;              // Polling interval (ms)
const DEBUG    = false;             // Enable logging
```

---

### Checkout Configuration

#### Default Behavior (Recommended)

The script automatically detects checkout pages by looking for specific Lightning Web Components.
**No configuration needed** — works with standard Salesforce B2B Commerce checkout flows.

**Components detected:**
```javascript
commerce_builder-checkout-contact-info
commerce_data_provider-checkout-data-provider
commerce_builder-checkout-payment
commerce_builder-checkout-delivery
commerce_cart-checkout-button
```

The event fires as soon as **one of these components** is found, regardless of cart items visibility.

---

#### Advanced: Add Custom Checkout Indicators

If your site uses a **custom checkout layout**, you can add your own component selectors:

**1. Locate the InitiateCheckout section in the script** (around line 430):

```javascript
/* ── 3c. InitiateCheckout ── */
(function () {
  // ...
  const checkoutIndicators = [
    'commerce_builder-checkout-contact-info',
    'commerce_data_provider-checkout-data-provider',
    'commerce_builder-checkout-payment',
    'commerce_builder-checkout-delivery',
    'commerce_cart-checkout-button',
  ];
  // ...
})();
```

**2. Add your custom selector to the array:**

```javascript
const checkoutIndicators = [
  'commerce_builder-checkout-contact-info',
  'commerce_data_provider-checkout-data-provider',
  'commerce_builder-checkout-payment',
  'commerce_builder-checkout-delivery',
  'commerce_cart-checkout-button',
  'my-custom-checkout-component',  // ← Your custom component
];
```

**3. Verify your component exists** (in browser console):

```javascript
document.querySelector('my-custom-checkout-component') !== null
```

---

#### Advanced: Enable Product Data Collection in Checkout

By default, the script attempts to collect product data from `commerce_cart-item` elements.
If your checkout page uses **different components** to display cart items:

**1. Find your cart item selector** (inspect the checkout page):

```html
<!-- Example: custom cart item structure -->
<my-custom-cart-item>
  <div class="product-info">
    <a href="/product/detail/ABC123">Product Name</a>
    <span class="price">€99.99</span>
  </div>
</my-custom-cart-item>
```

**2. Update the cart item selector** (around line 450):

```javascript
// Find this line in the InitiateCheckout section:
const cartItems = document.querySelectorAll('commerce_cart-item');

// Replace with your selector:
const cartItems = document.querySelectorAll('my-custom-cart-item');
```

**3. Update inner selectors** (product name, link, price):

```javascript
// Original selectors
const nameEl = item.querySelector('dxp_base-text-block p');
const link = item.querySelector('a[href*="/product/detail/"]');
const priceEl = item.querySelector('.item-prices .actualPrice span:last-child');

// Replace with your custom selectors
const nameEl = item.querySelector('.product-info a');
const link = item.querySelector('.product-info a');
const priceEl = item.querySelector('.product-info .price');
```

**Example configuration for custom checkout:**

```javascript
cartItems.forEach((item, index) => {
  // Product name (adapt selector)
  const nameEl = item.querySelector('.product-title');  // ← Your selector
  const fullText = nameEl?.textContent?.trim() || '';

  // Quantity (adapt selector or regex)
  const qtyEl = item.querySelector('.quantity-value');  // ← Your selector
  const quantity = parseInt(qtyEl?.textContent) || 1;

  // Product ID from link
  const link = item.querySelector('a[href*="/product/"]');  // ← Your selector
  const productId = link?.href?.split('/').pop();

  // Price (adapt selector)
  const priceEl = item.querySelector('.item-total-price');  // ← Your selector
  const priceText = priceEl?.textContent?.trim() || '';
  const totalPrice = parsePrice(priceText);
  const unitPrice = totalPrice ? parseFloat((totalPrice / quantity).toFixed(2)) : null;

  if (productId) {
    contentIds.push(productId);
    contents.push({ id: productId, quantity: quantity, item_price: unitPrice });
    if (totalPrice) totalValue += totalPrice;
    totalQuantity += quantity;
  }
});
```

---

### Custom Selectors

If default selectors don't work on your site, you can customize them in the `SEL` object (around line 230).

**Structure:**
```javascript
const SEL = {
  pdp: { /* Product Detail Page selectors */ },
  tile: { /* Product Tile selectors */ },
  checkout: { /* Checkout selectors */ },
  purchase: { /* Order Confirmation selectors */ },
};
```

**Example: Add a custom price selector for PDP:**

```javascript
price: [
  '.my-custom-price-class',  // ← Try this first
  'lightning-formatted-number[data-automation="productPricingMainPrice"]',
  'commerce-product-pricing-details .main-price lightning-formatted-number',
  'commerce-product-pricing-details lightning-formatted-number',
],
```

The script tries each selector **in order** until it finds a match.

---

## 🐛 Debug Mode

### Enable Logging

Open the browser console and run:

```javascript
window.__META_DEBUG = true
```

You'll see detailed logs prefixed with `[MetaPixel]`:

```
[MetaPixel] Pixel inizializzato – ID: 857591283934633
[MetaPixel] ViewContent ✓ {contentId: "ABC123", productName: "...", value: 99.99, ...}
[MetaPixel] URL cambiato → /checkout
[MetaPixel] InitiateCheckout: trovato componente checkout: commerce_builder-checkout-contact-info
[MetaPixel] InitiateCheckout ✓ {contentIds: ["ABC123", "DEF456"], totalValue: 199.98, ...}
```

### Verify Selectors

Test if selectors are working:

```javascript
// SKU
document.querySelector('commerce-field-display lightning-formatted-rich-text')?.shadowRoot?.querySelector('span')?.textContent;

// Price (PDP)
document.querySelector('lightning-formatted-number[data-automation="productPricingMainPrice"]')?.shadowRoot?.textContent;

// Product Name
document.querySelector('commerce_product_details-heading h1')?.textContent;
```

### Check Checkout Components

Verify which checkout components exist on your page:

```javascript
['commerce_builder-checkout-contact-info',
 'commerce_data_provider-checkout-data-provider',
 'commerce_builder-checkout-payment',
 'commerce_builder-checkout-delivery',
 'commerce_cart-checkout-button'
].forEach(sel => {
  const found = document.querySelector(sel);
  console.log(sel, found ? '✅ FOUND' : '❌ NOT FOUND');
});
```

### Verify Events in Meta

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) (Chrome extension)
2. Navigate your site and check that events appear in the extension popup
3. Go to [Meta Events Manager](https://business.facebook.com/events_manager) → Test Events
4. Verify parameters are correct

---

## 🔧 Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| **Event not firing** | Element not found | Enable debug mode, check which selector fails |
| **SKU empty / URL ID fallback** | Shadow DOM on SKU field | Verify with `.shadowRoot` in console, add custom selector |
| **Price `null`** | Shadow DOM or different class | Inspect element, add custom selector |
| **Duplicate events** | Rare, SPA navigation issue | Check `eventID` in Events Manager (should be unique) |
| **Multiple PageViews** | SPA navigation intercepted | **Expected behavior** — one PageView per route change |
| **InitiateCheckout not firing** | Custom checkout layout | Add your checkout component to `checkoutIndicators` array |
| **Purchase not firing** | Confirmation page structure changed | Check `SEL.purchase.successMessage` selector |

### Common Issues

#### 1. Elements Not Found

**Symptom:**
```
[MetaPixel] InitiateCheckout: trovati 0 cart items
```

**Solution:**
Your checkout uses custom components. See [Checkout Configuration](#checkout-configuration).

#### 2. Shadow DOM Access

**Symptom:**
`querySelector` returns the element, but `textContent` is empty.

**Solution:**
Access via `shadowRoot`:
```javascript
// ❌ Wrong
element.textContent  // Returns empty string

// ✅ Correct
element.shadowRoot?.textContent  // Returns actual text
```

#### 3. Async Rendering

**Symptom:**
Elements exist when you inspect manually, but script can't find them.

**Solution:**
Increase polling timeouts in the script:
```javascript
// Find the setInterval/setTimeout for the problematic event
[500, 1000, 2000, 3000, 4000].forEach(d => setTimeout(track, d));
// Add more timeouts: 5000, 6000, etc.
```

---

## 🏗️ Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Meta Pixel Base Init (fbq)                              │
│     → Loads Meta Pixel library                              │
│     → Sends initial PageView                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Utility Functions                                        │
│     → deepQuery()/deepQueryAll() - Shadow DOM traversal     │
│     → parsePrice() - Multi-format price parsing             │
│     → detectCurrency() - Auto currency detection            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Event Trackers (IIFEs with setInterval)                 │
│     → ViewContent: Polls for product detail page elements   │
│     → AddToCart: Click event listener on document           │
│     → InitiateCheckout: Polls for checkout components       │
│     → Purchase: Polls for order confirmation                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. SPA Navigation Interceptor                              │
│     → Wraps history.pushState/replaceState                  │
│     → Sends PageView on URL change                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### `deepQuery(selectors, root)`
Searches for an element across Shadow DOM boundaries.
Accepts a single selector or an array (tries each in order).

**Returns:** First matching element or `null`

#### `parsePrice(text)`
Parses prices in multiple formats:
- European: `1.234,56 €`
- US: `1,234.56 $`
- Compact: `1234.56` / `1234,56`

**Returns:** Float number or `null`

#### `detectCurrency()`
Auto-detects currency from page content by searching for:
1. Currency symbols (€, $, £, ¥, etc.)
2. ISO codes (EUR, USD, GBP, etc.)

**Returns:** ISO currency code (e.g., `"EUR"`)

#### `makeEventID()`
Generates unique UUID for event deduplication.

**Returns:** UUID string

---

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requirements:**
- ES6 support (arrow functions, `const`/`let`, template literals)
- `crypto.randomUUID()` or fallback UUID generation
- `sessionStorage` (for Purchase deduplication)

---

## 🤝 Contributing

Found a bug or have an improvement idea? Contributions are welcome!

**Report Issues:**
[Open an issue](https://github.com/alteavane/meta-pixel-sfcc/issues) with:
- Salesforce Commerce Cloud version
- Browser and version
- Console logs (with `window.__META_DEBUG = true`)
- Steps to reproduce

**Submit Code:**
1. Fork the repo
2. Make your changes and test in Salesforce sandbox
3. Submit a pull request

All contributions help the Salesforce B2B Commerce community! 🚀

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Useful Links

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Meta Events Manager](https://business.facebook.com/events_manager)
- [Salesforce B2B Commerce Documentation](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/commerce-b2b-introduction.html)
- [Lightning Web Components](https://developer.salesforce.com/docs/platform/lwc/overview)
- [Shadow DOM (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

---

## 💡 Tips & Best Practices

### 1. Test in Salesforce Sandbox First
Always test the script in a sandbox environment before deploying to production.

### 2. Use Meta's Test Events
Enable Test Events in Events Manager to verify tracking without affecting production data.

### 3. Monitor Console Errors
Keep debug mode on during initial setup to catch any selector issues.

### 4. Regularly Update Selectors
Salesforce updates may change component structures. Keep selectors up to date.

### 5. Document Custom Changes
If you customize selectors, document them for future reference.

---

## 👤 Author

**Created and maintained by [@alteavane](https://github.com/alteavane)**

- GitHub: [https://github.com/alteavane](https://github.com/alteavane)
- Repository: [https://github.com/alteavane/meta-pixel-sfcc](https://github.com/alteavane/meta-pixel-sfcc)

---

**Made with ❤️ for the Salesforce B2B Commerce community**

*If this script helped you, consider starring ⭐ the repository!*
