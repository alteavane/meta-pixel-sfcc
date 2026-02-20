# Project Structure

This document describes the organization of the Meta Pixel SFCC repository.

```
meta-pixel-sfcc/
│
├── README.md                           # Main documentation
├── LICENSE                             # MIT License
├── CHANGELOG.md                        # Version history and changes
├── PROJECT_STRUCTURE.md               # This file
├── .gitignore                         # Git ignore rules
│
├── meta-pixel-sfcc.js                 # 🎯 MAIN SCRIPT (production-ready)
│
├── docs/                              # 📚 Documentation
│   ├── INSTALLATION_GUIDE.md          # Step-by-step installation with visuals
│   └── salesforce-commerce-b2b-shadow-dom-guida.md  # Shadow DOM technical guide
│
└── examples/                          # 💡 Examples and utilities
    ├── pixel-meta-example.js  # Working example (EUR-specific)
    └── debug-checkout.js              # Debug script for checkout page
```

---

## File Descriptions

### Root Files

| File | Purpose | Audience |
|------|---------|----------|
| **README.md** | Main documentation, features, usage | All users |
| **LICENSE** | MIT License terms | All users |
| **CHANGELOG.md** | Version history, breaking changes | Developers |
| **.gitignore** | Files to exclude from Git | Developers |

### Main Script

| File | Purpose | Size | Audience |
|------|---------|------|----------|
| **meta-pixel-sfcc.js** | Production-ready Meta Pixel implementation | ~22KB | All users - this is what you install |

**Features:**
- Shadow DOM traversal
- Multi-currency support
- SPA navigation tracking
- Event deduplication
- Debug mode

**Installation:**
Paste the entire file content in Experience Builder → Settings → Advanced → Head Markup

---

### docs/ Directory

Documentation for advanced users and troubleshooting.

| File | Purpose | Audience |
|------|---------|----------|
| **INSTALLATION_GUIDE.md** | Step-by-step installation with visual references | Beginners |
| **salesforce-commerce-b2b-shadow-dom-guida.md** | Technical deep-dive on Shadow DOM in Salesforce LWC | Advanced developers |

**INSTALLATION_GUIDE.md** includes:
- Screenshots placeholders
- ASCII diagrams
- Common issues and solutions
- Verification steps

**salesforce-commerce-b2b-shadow-dom-guida.md** includes:
- How Shadow DOM works in LWC
- Best practices for selector writing
- Console commands for debugging
- Typical component structures

---

### examples/ Directory

Example scripts and utilities for developers.

| File | Purpose | Use Case |
|------|---------|----------|
| **pixel-meta-funzionante-example.js** | Simplified, EUR-specific implementation | Reference for custom implementations |
| **debug-checkout.js** | Diagnostic script for checkout page | Troubleshooting checkout issues |

**pixel-meta-funzionante-example.js:**
- Simpler version (300 lines vs 600)
- Hardcoded EUR currency
- Good starting point for customization
- Shows minimal working implementation

**debug-checkout.js:**
- Copy/paste into browser console
- Checks checkout components
- Verifies cart item selectors
- Suggests fixes

---

## For New Users

**Start here:**
1. Read [README.md](README.md) - Overview and features
2. Follow [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) - Step-by-step setup
3. Install `meta-pixel-sfcc.js` in Experience Builder
4. Verify with Meta Pixel Helper

**If you have issues:**
1. Enable debug mode: `window.__META_DEBUG = true`
2. Check [README.md - Troubleshooting](README.md#-troubleshooting)
3. Run `examples/debug-checkout.js` in console
4. Check [docs/salesforce-commerce-b2b-shadow-dom-guida.md](docs/salesforce-commerce-b2b-shadow-dom-guida.md) for selector help

---

## For Developers

**Understanding the codebase:**
1. Read [README.md - Architecture](README.md#-architecture)
2. Study `meta-pixel-sfcc.js` source code (well-commented)
3. Read [docs/salesforce-commerce-b2b-shadow-dom-guida.md](docs/salesforce-commerce-b2b-shadow-dom-guida.md)
4. Compare with `examples/pixel-meta-funzionante-example.js` (simpler version)

**Contributing:**
1. Fork the repository
2. Create a feature branch
3. Test thoroughly in Salesforce sandbox
4. Update CHANGELOG.md
5. Submit pull request

**Testing checklist:**
- [ ] Works on standard Salesforce B2B Commerce
- [ ] Works with custom checkout layouts
- [ ] No console errors
- [ ] Events verified in Meta Events Manager
- [ ] Debug mode produces clear logs
- [ ] No duplicate events

---

## Version Control

### What's tracked in Git

✅ **Tracked:**
- Source code (`*.js`)
- Documentation (`*.md`)
- License file
- Examples

❌ **Not tracked (see .gitignore):**
- OS files (`.DS_Store`, `Thumbs.db`)
- Editor config (`.vscode/`, `.idea/`)
- Node modules (if npm is used)
- Environment files (`.env`)

### Branching Strategy

**Recommended workflow:**
- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `hotfix/*` - Urgent fixes for production

---

## Maintenance

### Adding a new feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Update code in `meta-pixel-sfcc.js`
3. Update `CHANGELOG.md` under `[Unreleased]`
4. Update `README.md` if user-facing
5. Add examples if helpful
6. Test thoroughly
7. Submit PR to `develop`

### Releasing a new version

1. Update version in `CHANGELOG.md`
2. Move `[Unreleased]` items to new version section
3. Update date in CHANGELOG
4. Tag release: `git tag -a v2.1.0 -m "Release v2.1.0"`
5. Push tags: `git push --tags`
6. Create GitHub Release with notes from CHANGELOG

---

## Dependencies

**Zero dependencies** - Pure JavaScript

**Browser APIs used:**
- `querySelector` / `querySelectorAll`
- `shadowRoot`
- `MutationObserver` (not currently used, but available for future)
- `sessionStorage`
- `crypto.randomUUID()` (with fallback)
- `history.pushState` / `replaceState`

**Meta Pixel SDK:**
Loaded from Meta CDN: `https://connect.facebook.net/en_US/fbevents.js`

---

## License

MIT License - See [LICENSE](LICENSE) file

Free to use, modify, and distribute. Attribution appreciated but not required.

---

