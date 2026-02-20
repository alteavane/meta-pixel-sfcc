# Installation Guide - Salesforce Experience Builder

This guide provides step-by-step instructions with visual references for installing the Meta Pixel script in Salesforce Commerce Cloud B2B Experience Builder.

---

## Prerequisites

- [x] Access to Salesforce B2B Commerce store
- [x] Permission to edit Experience Builder settings
- [x] Meta Pixel ID from Meta Events Manager
- [x] Basic understanding of JavaScript (optional)

---

## Step-by-Step Installation

### Step 1: Get Your Meta Pixel ID

1. Navigate to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel (or create a new one)
3. Click **Settings** → **Pixel** tab
4. Copy your **Pixel ID** (15-digit number)

```
Example Pixel ID: 857591283934633
```

**💡 Tip:** Save this ID in a text file - you'll need it in Step 3.

---

### Step 2: Open Experience Builder

1. **Login to Salesforce**
   - Go to your Salesforce org (e.g., `https://yourorg.my.salesforce.com`)
   - Navigate to **App Launcher** (grid icon in top-left)

2. **Find your B2B Commerce store**
   ```
   App Launcher → Search "Digital Experiences" → Click "Digital Experiences"
   ```

3. **Open Experience Builder**
   ```
   Workspaces → [Your Store Name] → Click "Builder" button
   ```

**Visual reference:**
```
┌─────────────────────────────────────────────────────────────┐
│  Salesforce Setup                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Search Setup: "Digital Experiences"                     │
│                                                             │
│  Results:                                                   │
│  📁 Digital Experiences                                     │
│  📁 Digital Experience Settings                             │
│  📁 ...                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Click "Digital Experiences" → Then click "Builder" for your store
```

---

### Step 3: Configure the Script

1. **Open the script file**
   - Download `meta-pixel-sfcc.js` from the repository
   - Open it in a text editor (VS Code, Sublime Text, Notepad++, etc.)

2. **Find the configuration section**
   - Look for line ~26: `const PIXEL_ID = '000000000000000';`

3. **Replace with your Pixel ID**
   ```javascript
   // Before:
   const PIXEL_ID = '000000000000000';

   // After:
   const PIXEL_ID = '857591283934633';  // ← Your actual Pixel ID
   ```

4. **Save the file**

**💡 Tip:** You can also enable debug mode here:
```javascript
const DEBUG = true;  // Shows logs in browser console
```

---

### Step 4: Add Script to Experience Builder

1. **In Experience Builder, click the ⚙️ Settings icon** (top-right corner)

   ```
   ┌───────────────────────────────────────────────────────┐
   │  Experience Builder                      [ ⚙️ Settings] │
   ├───────────────────────────────────────────────────────┤
   │                                                       │
   │  [Your page preview]                                  │
   │                                                       │
   └───────────────────────────────────────────────────────┘
   ```

2. **Navigate to Advanced settings**
   ```
   Settings menu:
   ├── General
   ├── Theme
   ├── SEO
   ├── Advanced  ← Click here
   │   ├── Head Markup  ← Then click here
   │   └── ...
   └── Security
   ```

3. **Paste the script in Head Markup**

   You'll see a text area labeled **"Head Markup"**:

   ```
   ┌─────────────────────────────────────────────────────┐
   │  Head Markup                                        │
   ├─────────────────────────────────────────────────────┤
   │  Add custom code to the <head> section              │
   │                                                     │
   │  ┌─────────────────────────────────────────────┐   │
   │  │ <!-- Paste your code here -->               │   │
   │  │                                             │   │
   │  │                                             │   │
   │  │                                             │   │
   │  └─────────────────────────────────────────────┘   │
   │                                                     │
   └─────────────────────────────────────────────────────┘
   ```

   **Actions:**
   - Copy the **entire content** of `meta-pixel-sfcc.js` (including `<script>` tags)
   - Paste it into the **Head Markup** text area
   - Click **Save**

**⚠️ Important:**
- The script must include the opening `<script>` and closing `</script>` tags
- Do NOT add the script multiple times (check if it's already there)
- The entire script should be ~600 lines

---

### Step 5: Publish Changes

1. **Click the "Publish" button** (top-right in Experience Builder)

   ```
   ┌──────────────────────────────────────────────────────┐
   │  Experience Builder               [Publish ▼]  [⚙️]  │
   └──────────────────────────────────────────────────────┘
   ```

2. **Confirm publication**
   - A dialog will appear asking to confirm
   - Click **"Publish"** to make changes live

3. **Wait for publication to complete**
   - Status: "Publishing..." → "Published successfully"
   - This may take 30-60 seconds

**💡 Tip:** Changes are applied immediately to the live site after publication.

---

### Step 6: Verify Installation

#### Method 1: Using Meta Pixel Helper (Recommended)

1. **Install Meta Pixel Helper**
   - Chrome: [Meta Pixel Helper Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/)
   - Edge: Same link (compatible with Edge)

2. **Visit your store**
   - Navigate to your B2B Commerce storefront
   - The Pixel Helper icon should show a number (events detected)

3. **Check for PageView event**
   ```
   Meta Pixel Helper:
   ✅ PageView - 1 event
      Pixel ID: 857591283934633
   ```

4. **Navigate your site and verify events**
   - Go to a product page → Should show **ViewContent**
   - Click "Add to Cart" → Should show **AddToCart**
   - Go to /checkout → Should show **InitiateCheckout**

#### Method 2: Using Browser Console

1. **Open browser console** (F12 or Cmd+Option+I on Mac)

2. **Enable debug mode**
   ```javascript
   window.__META_DEBUG = true
   ```

3. **Navigate your site and check logs**
   ```
   Console output:
   [MetaPixel] Pixel inizializzato – ID: 857591283934633
   [MetaPixel] ViewContent ✓ {contentId: "ABC123", ...}
   [MetaPixel] AddToCart ✓ {contentId: "ABC123", ...}
   ```

#### Method 3: Using Meta Events Manager

1. **Go to [Meta Events Manager](https://business.facebook.com/events_manager)**

2. **Select your Pixel**

3. **Click "Test Events" in the left sidebar**

4. **Navigate your store in another tab**
   - Events should appear in real-time in the Test Events panel
   - Each event should show its parameters (content_ids, value, currency, etc.)

---

## Common Installation Issues

### Issue 1: Script not loading

**Symptom:** Meta Pixel Helper shows "No pixel found"

**Solutions:**
1. Verify the script is in **Head Markup** (not Footer Markup)
2. Check that `<script>` and `</script>` tags are present
3. Ensure you clicked **Publish** after saving
4. Clear browser cache and reload the page
5. Check browser console for JavaScript errors (F12)

---

### Issue 2: Wrong Pixel ID

**Symptom:** Meta Pixel Helper shows different Pixel ID than expected

**Solutions:**
1. Re-open `meta-pixel-sfcc.js`
2. Verify `const PIXEL_ID = 'YOUR_ID';` matches your actual Pixel ID
3. Re-save and re-paste the script in Head Markup
4. Publish again

---

### Issue 3: Events not firing

**Symptom:** PageView works, but ViewContent/AddToCart don't

**Solutions:**
1. Enable debug mode: `window.__META_DEBUG = true`
2. Check console logs for errors
3. Verify selectors match your site structure (see [README.md](../README.md#custom-selectors))
4. Run the debug script: [examples/debug-checkout.js](../examples/debug-checkout.js)

---

### Issue 4: Duplicate events

**Symptom:** Same event appears twice in Events Manager

**Solutions:**
1. Check if the script is pasted **only once** in Head Markup
2. Check if there's another Meta Pixel implementation on the site
3. Verify in Meta Events Manager that `eventID` values are unique

---

## Visual Checklist

Use this checklist to verify your installation:

```
Installation Checklist:
□ Meta Pixel ID obtained from Meta Events Manager
□ meta-pixel-sfcc.js downloaded and configured with Pixel ID
□ Experience Builder opened in Salesforce
□ Settings → Advanced → Head Markup accessed
□ Script pasted in Head Markup (including <script> tags)
□ Changes saved
□ Changes published
□ Meta Pixel Helper installed (Chrome/Edge)
□ PageView event verified on homepage
□ ViewContent verified on product page
□ AddToCart verified by clicking "Add to Cart"
□ InitiateCheckout verified on /checkout page
□ Purchase verified on order confirmation (optional - requires test order)
```

---

## Screenshots Placeholder

> **Note:** For visual screenshots of the Experience Builder interface:
> 1. Take screenshots of your own Salesforce org following the steps above
> 2. Or refer to [Salesforce official documentation](https://help.salesforce.com/s/articleView?id=sf.community_builder_overview.htm)

**Recommended screenshots to add:**
- Experience Builder Settings button location
- Settings → Advanced → Head Markup menu path
- Head Markup text area with script pasted
- Publish button location
- Meta Pixel Helper extension showing PageView

---

## Next Steps

After successful installation:

1. **Configure custom selectors** (if needed)
   - See [README.md - Custom Selectors](../README.md#custom-selectors)

2. **Test all events**
   - Product pages (ViewContent)
   - Add to Cart functionality (AddToCart)
   - Checkout page (InitiateCheckout)
   - Order confirmation (Purchase)

3. **Set up Meta Conversions API** (optional)
   - For enhanced tracking and deduplication
   - See [Meta Conversions API documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)

4. **Create Meta Ad Campaigns**
   - Use the tracked events for retargeting and conversion optimization
   - See [Meta Ads Manager](https://www.facebook.com/adsmanager)

---

## Support

If you encounter issues not covered in this guide:

1. Check [Troubleshooting section in README](../README.md#-troubleshooting)
2. Run the debug script: [examples/debug-checkout.js](../examples/debug-checkout.js)
3. [Open an issue](https://github.com/alteavane/meta-pixel-sfcc/issues) with:
   - Console logs (with `window.__META_DEBUG = true`)
   - Browser and version
   - Salesforce Commerce Cloud version
   - Steps to reproduce

---

**Installation complete!** 🎉

Your Meta Pixel should now be tracking events on your Salesforce B2B Commerce store.
