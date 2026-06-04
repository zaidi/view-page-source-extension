# View Page Source - Opera Extension

An Opera browser extension that allows you to quickly view any webpage's HTML source code, detect technologies, and get comprehensive SEO analysis on [View Page Source](https://www.view-page-source.com).

## Features

- **Multiple Tools** - View Source, SEO Check, Social Preview, and Extract HTML, from the toolbar popup or the right-click menu
- **One-Click Access** - Click the extension icon or use a keyboard shortcut (`Ctrl+Shift+U` / `Cmd+Shift+U`)
- **Right-Click Context Menu** - Run any tool on the current page, a linked page, or an image
- **Quick Look** - See a page's HTTP status, title, size, tag/word counts, and generator inline in the popup, without opening a new tab
- **Recent History** - Re-open the last 10 pages you analyzed (stored locally on your device)
- **Options Page** - Choose your default tool, default formatting, and whether the toolbar button opens the popup or runs your default tool instantly
- **Per-Tool Shortcuts** - Assign keyboard shortcuts to SEO Check, Social Preview, and Extract HTML
- **Toolbar Status Badge** - After a Quick Look, the icon shows the page's HTTP status code, colour-coded
- **Smart Analysis** - Comprehensive SEO audit covering meta tags, Open Graph, structured data (JSON-LD), internationalization, links, resources, and security indicators
- **Technology Detection** - Identify 100+ technologies including CMS platforms (WordPress, Shopify, Wix), JavaScript frameworks (React, Vue, Next.js), CSS frameworks (Tailwind, Bootstrap), analytics (Google Analytics, Hotjar), CDNs, payment systems, and more
- **Performance Metrics** - DNS lookup, TCP connection, TLS handshake, server response, and download times
- **Dark Mode** - The popup and options follow your system theme
- **Privacy-Focused** - Minimal permissions, no tracking by the extension

## Installation

### Install from Opera Add-ons (Recommended)
Coming soon!

### Install Manually (Developer Mode)

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to the `browser-plugin/opera/` directory

2. **Open Opera Extensions Page**
   - Open Opera and go to `opera://extensions`
   - Or open the browser menu, then Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `browser-plugin/opera/` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the extensions icon (puzzle piece) in the Opera toolbar
   - Find "View Page Source" and click the pin icon

### Install from Chrome Web Store

Opera can install Chrome extensions directly:

1. Install the "Install Chrome Extensions" add-on from Opera Add-ons
2. Visit the Chrome Web Store
3. Search for "View Page Source"
4. Click "Add to Opera"

## Usage

### Toolbar Button
Click the extension icon to open the popup. From there you can run **View Source**, **SEO Check**, **Social Preview**, or **Extract HTML** on the current page, run a **Quick Look**, or re-open a page from **Recent**. (You can switch the toolbar button to run your default tool instantly instead of opening the popup. See the Options page.)

### Right-Click Menu
Right-click a **page**, a **link**, or an **image** and choose from the **View Page Source** submenu to run any tool. On a link it analyzes the link's target; on an image it inspects the image resource.

### Keyboard Shortcuts
- `Ctrl+Shift+U` (Win/Linux) / `Cmd+Shift+U` (Mac) runs your **default tool** on the current page
- SEO Check, Social Preview, and Extract HTML can each be given their own shortcut at `opera://extensions/shortcuts`

### Quick Look
Click **Quick Look** in the popup to fetch a compact summary (HTTP status, title, size, tag and word counts, and generator) without opening a new tab. The toolbar badge then shows the page's status code.

### Options
Open the extension's options to set your **default tool**, **default formatting** (syntax highlighting / word wrap), and the **toolbar-button behaviour** (open the popup, or run the default tool instantly).

## Quick Settings

The popup's quick settings control formatting applied when viewing source code:

- **Enable syntax highlighting** - Color-coded HTML for better readability
- **Enable word wrap** - Wrap long lines of code

Your settings are saved automatically and synced across devices (if signed into Opera sync). Your **recent-history** list is stored locally on this device only.

## Supported Pages

The extension works on:
- All HTTP and HTTPS websites
- Localhost and local development servers

The extension does NOT work on:
- Opera internal pages (`opera://`, `chrome://`)
- Extension pages (`chrome-extension://`)
- Browser settings pages
- File URLs (`file://`)
- Other special URLs (`about:`, `data:`, etc.)

When viewing an unsupported page, the extension icon will indicate it's not available.

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
- **activeTab** - Access the URL of the current tab only when you invoke the extension
- **contextMenus** - Add the "View Page Source" options to the right-click menu
- **storage** - Save your preferences and your recent-history list
- **Access to `www.view-page-source.com`** - Lets the **Quick Look** feature fetch a page summary directly from the View Page Source API. The extension only ever talks to this one site.

The extension requests minimal permissions and only accesses the URL of tabs you explicitly interact with.

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Default tool (View Source) | `Ctrl+Shift+U` | `Cmd+Shift+U` |
| SEO Check | _unassigned_ | _unassigned_ |
| Social Preview | _unassigned_ | _unassigned_ |
| Extract HTML | _unassigned_ | _unassigned_ |

### Customize Keyboard Shortcuts
1. Go to `opera://extensions/shortcuts`
2. Find "View Page Source"
3. Click the edit icon next to any command and set your preferred shortcut

## Troubleshooting

### Extension Icon is Greyed Out
The current page is not supported (e.g., `opera://` pages). Try navigating to an HTTP or HTTPS website.

### "Failed to fetch URL" Error
- The website may be blocking requests from View Page Source
- The website may have rate limiting or security measures
- Try again in a few moments

### Source Code Not Loading Automatically
- Check your browser's popup blocker settings
- Ensure JavaScript is enabled
- Try clicking the extension icon again

### Popup Not Appearing
- The extension may not be properly installed
- Try disabling and re-enabling the extension in `opera://extensions`
- Reinstall the extension if issues persist

## Compatibility

Opera is based on Chromium, so this extension uses the same codebase as the Chrome version with minor Opera-specific adjustments:

- Uses Manifest V3 (same as Chrome)
- Compatible with Opera 88+
- Uses `chrome.*` API namespace (standard for Chromium-based browsers)
- Includes `opera://` in blocked URL schemes

## Development

### Project Structure
```
browser-plugin/opera/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (event handling)
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── icons/                 # Extension icons (16, 32, 48, 128)
├── README.md              # This file
└── PRIVACY.md             # Privacy policy
```

### Making Changes

1. Edit the extension files
2. Go to `opera://extensions`
3. Click the refresh icon on the View Page Source extension card
4. Test your changes

### Building for Production

1. Remove any development/testing code
2. Update version in `manifest.json`
3. Test thoroughly in different scenarios
4. Zip the `opera/` folder for upload to Opera Add-ons

## Opera Add-ons Submission

### Requirements
- Opera developer account (free)
- Extension package (zip or crx file)
- Privacy policy
- Extension description and screenshots

### Submission Process
1. Create account at [addons.opera.com/developer](https://addons.opera.com/developer/)
2. Click "Add new extension"
3. Upload zip file of the `opera/` folder
4. Fill in listing details
5. Submit for review

## Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/zaidi/view-page-source-extension).

## License

This extension is part of the View Page Source project.

## Support

- **Website**: [https://www.view-page-source.com](https://www.view-page-source.com)
- **Issues**: Report bugs or request features on GitHub
- **Privacy Policy**: See [PRIVACY.md](PRIVACY.md)

## Changelog

### Version 1.2.0 (2026-06-04)
- **New tools**: SEO Check, Social Preview, and Extract HTML, from the popup and the right-click menu
- **Link & image context menus**: analyze a link's target or an image resource without navigating to it
- **Quick Look**: inline page summary (HTTP status, title, size, tag/word counts, generator) in the popup
- **Recent history**: re-open the last 10 pages you analyzed (stored locally)
- **Options page**: default tool, default formatting, and toolbar-button behaviour (popup vs. instant)
- **Per-tool keyboard shortcuts** for SEO Check, Social Preview, and Extract HTML
- **Toolbar status badge** showing the HTTP status after a Quick Look
- **Dark mode** for the popup and options, following your system theme
- **Localization-ready** (English included; other locales drop into `_locales/`)
- Added access to `www.view-page-source.com` to power Quick Look

### Version 1.1.2 (2026-06-03)
- Keyboard shortcut now opens the source viewer directly instead of just opening the popup
- Right-clicking inside an iframe now views that frame's source
- Context menu now only appears on http/https pages
- Removed the `notifications` permission (no longer needed)
- Context menu and keyboard shortcut now honour your saved syntax-highlighting and word-wrap preferences

### Version 1.1.1 (2026-03-09)
- Added `notifications` permission for unsupported page alerts
- Removed unnecessary `host_permissions` to reduce install warnings
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
- Initial release for Opera
- Toolbar button functionality
- Right-click context menu
- Keyboard shortcut support
- Popup interface with quick settings
- Syntax highlighting and word wrap preferences
- Support for HTTP and HTTPS websites

---

Made for developers, designers, and the curious minds exploring the web.
