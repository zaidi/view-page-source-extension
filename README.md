# View Page Source - Browser Extensions

Browser extensions for [View Page Source](https://www.view-page-source.com) — view source code, detect 100+ technologies, and analyze SEO for any website.

## Extensions

| Browser | Manifest | Status | Install |
|---------|----------|--------|---------|
| [Chrome](chrome/) | V3 | Published | [Chrome Web Store](https://chromewebstore.google.com/detail/view-page-source/mmlapknmkidbhfdilplpajfnpkmoelea) |
| [Firefox](firefox/) | V2 | Published | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/view-page-source-html-viewer/) |
| [Opera](opera/) | V3 | Coming soon | [Opera Add-ons](#) |

## Features

- **One-Click Access** - Toolbar button or keyboard shortcut
- **Six Tools** - View Source, SEO Check, Headers Check, Social Preview, Extract HTML, and Download Source
- **Right-Click Context Menu** - Run any tool on a page, a link's target, or an image
- **Quick Look** - Inline page summary in the popup, with a colour-coded status badge
- **Your Language** - Opens view-page-source.com in your browser's language (12 languages supported)
- **Smart Analysis** - SEO audit covering meta tags, Open Graph, structured data, links, resources, and security indicators
- **Technology Detection** - Identify 100+ technologies including CMS, frameworks, analytics, CDNs, and more
- **Performance Metrics** - DNS, TCP, TLS, server response, and download times
- **Quick Settings** - Syntax highlighting and word wrap preferences, plus an Options page for the default tool, website language, and toolbar behaviour
- **Privacy-Focused** - Minimal permissions, no data collection

## How It Works

1. Click the extension icon, right-click a page, or use the keyboard shortcut
2. A new tab opens on [view-page-source.com](https://www.view-page-source.com) with the source code and analysis loaded

The extension itself doesn't fetch or process source code — it sends the URL to the website, which handles all the analysis server-side. (Quick Look calls the same website's API from the extension.)

## Development

Each browser has its own directory with a self-contained extension:

```
chrome/     Chrome/Chromium (Manifest V3)
firefox/    Firefox (Manifest V2)
opera/      Opera (Manifest V3)
```

The three builds share the same code apart from the browser API namespace (`chrome.*` vs `browser.*`) and a few browser-specific details, so a change to one usually needs making in all three. `tools.js` in each holds the tool list and the page path of every tool in each website language — keep it identical across the builds, and update it when the website adds a tool or a language.

See each browser's README for installation and development instructions.

## Privacy

Each extension includes a detailed privacy policy. In short:
- Only the URL you choose to analyze is sent to view-page-source.com
- No browsing history, personal data, or tracking
- Preferences stored locally via browser sync storage

## License

See [LICENSE](LICENSE) for details.
