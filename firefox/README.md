# View Page Source - Firefox Extension

A Firefox browser extension that allows you to quickly view any webpage's HTML source code, detect technologies, and get comprehensive SEO analysis on [View Page Source](https://www.view-page-source.com).

## Features

- **One-Click Access** - Click the extension icon or use keyboard shortcut (`Ctrl+Shift+Y` / `Cmd+Shift+Y`)
- **Right-Click Context Menu** - Right-click on any page and select "View Page Source"
- **Smart Analysis** - Comprehensive SEO audit covering meta tags, Open Graph, structured data (JSON-LD), internationalization, links, resources, and security indicators
- **Technology Detection** - Identify 100+ technologies including CMS platforms (WordPress, Shopify, Wix), JavaScript frameworks (React, Vue, Next.js), CSS frameworks (Tailwind, Bootstrap), analytics (Google Analytics, Hotjar), CDNs, payment systems, and more
- **Performance Metrics** - Get detailed timing data including DNS lookup, TCP connection, TLS handshake, server response, and download times
- **Quick Settings** - Configure syntax highlighting and word wrap preferences
- **Instant Results** - Opens a new tab with the source code and analysis automatically loaded
- **Privacy-Focused** - Minimal permissions, no data collection by the extension

## Installation

### Install from Firefox Add-ons (Recommended)
Coming soon!

### Install Manually (Developer Mode)

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to the `browser-plugin/firefox/` directory

2. **Open Firefox Add-ons Debugging Page**
   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Or type `about:debugging` in the address bar and click "This Firefox"

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on..."
   - Navigate to `browser-plugin/firefox/` folder
   - Select the `manifest.json` file
   - The extension should now appear in your toolbar

**Note**: Temporary add-ons are removed when Firefox is closed. For permanent installation, the extension needs to be signed and installed from Firefox Add-ons.

### Install Permanently (Unsigned - Developer Edition/Nightly Only)

1. Open `about:config`
2. Set `xpinstall.signatures.required` to `false`
3. Zip the `firefox/` folder contents
4. Rename to `.xpi` extension
5. Drag and drop into Firefox

## Usage

### Method 1: Toolbar Button
1. Navigate to any webpage (HTTP or HTTPS)
2. Click the View Page Source extension icon in the toolbar
3. A new tab opens with the source code automatically loaded

### Method 2: Right-Click Menu
1. Navigate to any webpage
2. Right-click anywhere on the page
3. Select "View Page Source" from the context menu
4. A new tab opens with the source code automatically loaded

### Method 3: Keyboard Shortcut
1. Navigate to any webpage
2. Press `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac)
3. A new tab opens with the source code automatically loaded

### Method 4: Popup Interface
1. Click the extension icon to open the popup
2. Review the current page URL
3. Adjust quick settings (syntax highlighting, word wrap)
4. Click "View Source" button

## Quick Settings

The extension popup allows you to configure preferences that will be applied when viewing source code:

- **Enable syntax highlighting** - Color-coded HTML for better readability
- **Enable word wrap** - Wrap long lines of code

Your settings are saved automatically and synced across devices (if signed into Firefox Sync).

## Supported Pages

The extension works on:
- All HTTP and HTTPS websites
- Localhost and local development servers

The extension does NOT work on:
- Firefox internal pages (`about:`, `moz-extension://`)
- Resource pages (`resource://`)
- View-source pages (`view-source:`)
- File URLs (`file://`)
- Data URLs (`data:`, `javascript:`)

When viewing an unsupported page, the extension will indicate it's not available.

## Privacy & Security

### What Data is Sent
- **Only the URL** you choose to analyze is sent to `https://www.view-page-source.com`
- The website fetches and analyzes the source code on the server

### What is NOT Collected
- No browsing history
- No personal information
- No usage tracking by the extension
- No third-party analytics in the extension

### Permissions Explained
- **activeTab** - Access the URL of the current tab only when you click the extension
- **contextMenus** - Add "View Page Source" option to the right-click menu
- **storage** - Save your preferences (syntax highlighting, word wrap settings)
- **notifications** - Show notifications when viewing unsupported pages

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| View Source | `Ctrl+Shift+Y` | `Cmd+Shift+Y` |

### Customize Keyboard Shortcut
1. Go to `about:addons`
2. Click the gear icon (⚙️) → "Manage Extension Shortcuts"
3. Find "View Page Source"
4. Set your preferred shortcut

## Troubleshooting

### Extension Icon is Greyed Out
The current page is not supported (e.g., `about:` pages). Try navigating to an HTTP or HTTPS website.

### "Failed to fetch URL" Error
- The website may be blocking requests from View Page Source
- The website may have rate limiting or security measures
- Try again in a few moments

### Source Code Not Loading Automatically
- Check your browser's popup blocker settings
- Ensure JavaScript is enabled
- Try clicking the extension icon again

### Extension Disappeared After Restart
Temporarily loaded add-ons are removed when Firefox closes. For permanent installation:
- Wait for the extension to be published on Firefox Add-ons
- Or use Firefox Developer Edition with signature checking disabled

## Development

### Project Structure
```
browser-plugin/firefox/
├── manifest.json           # Extension configuration (Manifest V2)
├── background.js           # Background script (event handling)
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── icons/                 # Extension icons (16, 32, 48, 128)
├── README.md              # This file
└── PRIVACY.md             # Privacy policy
```

### Key Differences from Chrome Version

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest Version | V3 | V2 |
| Background | Service Worker | Background Script |
| Action API | `chrome.action` | `browser.browserAction` |
| Promise API | Callbacks + Promises | Native Promises |
| Extension URL | `chrome-extension://` | `moz-extension://` |

### Making Changes

1. Edit the extension files
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Reload" on the View Page Source extension
4. Test your changes

### Building for Production

1. Remove any development/testing code
2. Update version in `manifest.json`
3. Test thoroughly in different scenarios
4. Submit to Firefox Add-ons for signing and distribution

## Firefox Add-ons Submission

### Requirements
- Mozilla developer account (free)
- Source code (may be requested for review)
- Privacy policy
- Extension description and screenshots

### Submission Process
1. Create account at [addons.mozilla.org](https://addons.mozilla.org)
2. Click "Submit a New Add-on"
3. Upload zip file of the `firefox/` folder
4. Fill in listing details
5. Submit for review (typically 1-5 days)

## Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/zaidi/view-page-source-extension).

## License

This extension is part of the View Page Source project.

## Support

- **Website**: [https://www.view-page-source.com](https://www.view-page-source.com)
- **Issues**: Report bugs or request features on GitHub
- **Privacy Policy**: See [PRIVACY.md](PRIVACY.md)

## Changelog

### Version 1.1.1 (2026-03-09)
- Added `data_collection_permissions` for Firefox AMO compliance
- Changed keyboard shortcut to `Ctrl+Shift+Y` / `Cmd+Shift+Y` to avoid conflict with Firefox's built-in view source shortcut
- Removed dead code (unused onClicked and onCommand listeners)
- Open sourced extension on GitHub

### Version 1.1.0 (2025-01-01)
- **New: Smart Analysis** - Comprehensive SEO audit with 8 analysis sections
  - SEO Meta Tags analysis with recommendations
  - Open Graph & Social media preview with image thumbnails
  - Structured Data (JSON-LD, Microdata) parsing and validation
  - Internationalization (lang, hreflang) detection
  - Link Analysis (internal, external, broken links)
  - Resource inventory (scripts, stylesheets, images)
  - Document Structure analysis
  - Security Indicators (HTTPS, mixed content, CSP)
- **New: Technology Detection** - Identify 100+ technologies
  - CMS: WordPress, Shopify, Wix, Squarespace, Webflow, Drupal, Ghost
  - JS Frameworks: React, Vue, Angular, Next.js, Nuxt, Svelte, jQuery, Alpine.js, HTMX
  - CSS Frameworks: Tailwind, Bootstrap, Bulma, Material UI, Chakra UI
  - Analytics: Google Analytics 4, Hotjar, Clarity, Mixpanel, Plausible, Fathom
  - Marketing: Facebook Pixel, LinkedIn, Twitter, TikTok pixels
  - E-commerce & Payment: WooCommerce, Stripe, PayPal, Klarna
  - Hosting & CDN: Cloudflare, Vercel, Netlify, AWS CloudFront
  - Chat: Intercom, Zendesk, Drift, Crisp, Tawk.to
  - Security: reCAPTCHA, hCaptcha, Sentry, New Relic
  - And many more...
- Updated extension description and metadata

### Version 1.0.0 (2025-12-29)
- Initial release for Firefox
- Toolbar button functionality
- Right-click context menu
- Keyboard shortcut support
- Popup interface with quick settings
- Syntax highlighting and word wrap preferences
- Support for HTTP and HTTPS websites

---

Made for developers, designers, and the curious minds exploring the web.
