/**
 * ============================================================
 *  DEBUG SCRIPT FOR CHECKOUT PAGE - Meta Pixel SFCC
 * ============================================================
 *  Copy and paste this code into the browser console
 *  on the /checkout page to diagnose issues.
 *
 *  Usage:
 *  1. Navigate to /checkout page
 *  2. Open browser console (F12)
 *  3. Paste this entire script
 *  4. Press Enter
 *  5. Review the output
 * ============================================================
 */

console.log('=== DEBUG CHECKOUT - Meta Pixel ===\n');

// 1. Verify URL
console.log('1️⃣ URL corrente:', window.location.pathname);
console.log('   Contiene "/checkout"?', window.location.pathname.includes('/checkout') ? '✅ SÌ' : '❌ NO');

// 2. Verify checkout components
console.log('\n2️⃣ Verifica componenti checkout:');
const checkoutComponents = [
  'commerce_builder-checkout-contact-info',
  'commerce_data_provider-checkout-data-provider',
  'commerce_builder-checkout-payment',
  'commerce_builder-checkout-delivery',
  'commerce_cart-checkout-button',
];

let foundComponent = null;
checkoutComponents.forEach(sel => {
  const found = document.querySelector(sel);
  console.log(`   ${sel}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
  if (found && !foundComponent) foundComponent = sel;
});

if (foundComponent) {
  console.log(`\n   ✅ Checkout component detected: ${foundComponent}`);
  console.log('   → InitiateCheckout event SHOULD fire');
} else {
  console.log('\n   ❌ NO checkout components found!');
  console.log('   → Add your custom checkout component to the script');
}

// 3. Verify commerce_cart-item
console.log('\n3️⃣ Verifica cart items:');
const cartItems = document.querySelectorAll('commerce_cart-item');
console.log('   Trovati:', cartItems.length, 'cart items');
if (cartItems.length === 0) {
  console.log('   ℹ️  Nessun cart item trovato (OK se non visualizzati nel tuo layout)');
} else {
  console.log('   Elementi trovati:', cartItems);
}

// 4. If cart items found, test selectors
if (cartItems.length > 0) {
  console.log('\n4️⃣ Analisi primo cart item:');
  const item = cartItems[0];

  // Product name
  const nameEl = item.querySelector('dxp_base-text-block p');
  const nameText = nameEl?.textContent?.trim() || '';
  console.log('   📦 Nome prodotto:');
  console.log('      Selettore: dxp_base-text-block p');
  console.log('      Elemento trovato?', nameEl ? '✅ SÌ' : '❌ NO');
  console.log('      Testo:', nameText || '(vuoto)');

  // Product link
  const link = item.querySelector('a[href*="/product/detail/"]');
  const productId = link?.href?.split('/').pop();
  console.log('\n   🔗 Link prodotto:');
  console.log('      Selettore: a[href*="/product/detail/"]');
  console.log('      Elemento trovato?', link ? '✅ SÌ' : '❌ NO');
  console.log('      Product ID:', productId || '(non trovato)');

  // Price
  const priceEl = item.querySelector('.item-prices .actualPrice span:last-child');
  const priceText = priceEl?.textContent?.trim() || '';
  console.log('\n   💰 Prezzo:');
  console.log('      Selettore: .item-prices .actualPrice span:last-child');
  console.log('      Elemento trovato?', priceEl ? '✅ SÌ' : '❌ NO');
  console.log('      Testo:', priceText || '(vuoto)');

  // HTML structure
  console.log('\n   📄 HTML struttura item (primi 500 caratteri):');
  console.log(item.outerHTML.substring(0, 500) + '...');
}

// 5. Test alternative selectors for cart items
console.log('\n5️⃣ Test selettori alternativi per cart items:');
const alternatives = [
  'commerce_cart-item',
  'commerce-cart-item',
  '[class*="cart-item"]',
  '[class*="cart_item"]',
];
alternatives.forEach(sel => {
  const found = document.querySelectorAll(sel);
  console.log(`   ${sel}: ${found.length} elementi`, found.length > 0 ? '✅' : '❌');
});

// 6. Find all elements containing "cart" or "checkout" in tag name
console.log('\n6️⃣ Tutti gli elementi con "cart" o "checkout" nel tag name:');
const allElements = document.querySelectorAll('*');
const relevantElements = Array.from(allElements).filter(el => {
  const tag = el.tagName.toLowerCase();
  return tag.includes('cart') || tag.includes('checkout') || tag.includes('commerce');
});
const uniqueTags = [...new Set(relevantElements.map(el => el.tagName.toLowerCase()))];
console.log('   Tag trovati:', uniqueTags);

// 7. Summary
console.log('\n=== SUMMARY ===');
console.log(`✓ URL is /checkout: ${window.location.pathname.includes('/checkout')}`);
console.log(`✓ Checkout component found: ${!!foundComponent}`);
console.log(`✓ Cart items found: ${cartItems.length}`);

console.log('\n💡 NEXT STEPS:');
if (!foundComponent) {
  console.log('   ❌ Add your checkout component to checkoutIndicators array');
  console.log('      Look at "Tag trovati" above and add the appropriate selector');
} else if (cartItems.length === 0) {
  console.log('   ℹ️  Event will fire WITHOUT product data (OK for basic tracking)');
  console.log('   ℹ️  To include product data, configure cart item selectors');
} else {
  console.log('   ✅ Everything looks good!');
  console.log('   ✅ Event should fire with full product data');
}

console.log('\n=== END DEBUG ===');
