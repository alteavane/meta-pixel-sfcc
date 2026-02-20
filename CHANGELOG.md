# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-02-20

### Added
- **Component-based checkout detection**: InitiateCheckout now triggers based on presence of checkout components instead of cart items
  - Supports: `commerce_builder-checkout-contact-info`, `commerce_data_provider-checkout-data-provider`, `commerce_builder-checkout-payment`, `commerce_builder-checkout-delivery`, `commerce_cart-checkout-button`
  - Event fires even without visible cart items (more robust for custom layouts)
- **Optional product data collection**: Attempts to collect product IDs, prices, and quantities if cart items are available, but sends event regardless
- **Enhanced debug logging**: Detailed step-by-step logging for troubleshooting
  - Shows which checkout component triggered the event
  - Reports cart items found/not found
  - Logs individual item processing
- **Extended timeout coverage**: Increased checkout polling timeouts from 2s to 4s for slower-rendering pages

### Changed
- **InitiateCheckout logic redesigned**: More resilient to different Salesforce B2B Commerce configurations
- **Simplified querySelector usage in checkout**: Removed complex deepQueryAll fallback logic in favor of direct selectors (checkout elements are typically in Light DOM)
- **Reduced logging verbosity**: Removed repetitive "check" logs when event already tracked

### Fixed
- InitiateCheckout not firing on checkout pages with custom layouts
- InitiateCheckout failing when cart items not visible in DOM
- Excessive console logging creating noise in debug mode

## [1.0.0] - 2025-XX-XX

### Added
- Initial release
- Shadow DOM traversal with `deepQuery()` and `deepQueryAll()` utilities
- Multi-currency auto-detection (40+ currencies supported)
- Multi-format price parsing (European, US, compact formats)
- SPA navigation tracking (intercepts `pushState`/`replaceState`)
- Event deduplication with unique `eventID` and `sessionStorage`
- Multi-language "Add to Cart" button detection (6 languages)
- Debug mode activatable from console
- Events tracked:
  - **PageView**: Every page load + SPA navigation
  - **ViewContent**: Product detail pages
  - **AddToCart**: Click on "Add to Cart" (PDP + product tiles)
  - **InitiateCheckout**: Checkout page visit (cart item-based)
  - **Purchase**: Order confirmation page
- Selector fallback chains for robust element detection
- Automatic parsing of product SKU from Shadow DOM
- Price extraction from `lightning-formatted-number` components
- Anti-duplication for Purchase events via `sessionStorage`

### Technical Details
- Pure JavaScript, zero dependencies
- Compatible with Salesforce Commerce Cloud B2B (LWR/LWC)
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- ES6+ syntax (arrow functions, const/let, template literals)

---

## Version History Summary

| Version | Date | Key Changes |
|---------|------|-------------|
| 2.0.0 | 2026-02-20 | Component-based checkout detection, optional product data |
| 1.0.0 | 2025-XX-XX | Initial release with Shadow DOM support |

---

## Upgrade Guide

### From 1.x to 2.0

**Breaking Changes:** None - fully backward compatible

**New Features:**
- InitiateCheckout is now more robust and works without cart items
- Debug logging is cleaner and more informative

**Migration Steps:**
1. Replace your existing script with the new version
2. No configuration changes needed for standard setups
3. If you have custom checkout layouts:
   - Add your checkout component selectors to `checkoutIndicators` array (see README)
   - Configure cart item selectors if you want product data (optional)

**Recommended Actions:**
- Enable debug mode (`window.__META_DEBUG = true`) to verify events fire correctly
- Test on sandbox before deploying to production
- Review Meta Events Manager to confirm data quality

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Links

- [GitHub Repository](https://github.com/alteavane/meta-pixel-sfcc)
- [Issue Tracker](https://github.com/alteavane/meta-pixel-sfcc/issues)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
