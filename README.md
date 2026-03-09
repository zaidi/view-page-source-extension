# View Page Source - Browser Extensions

Browser extensions for [View Page Source](https://www.view-page-source.com) — view source code, detect 100+ technologies, and analyze SEO for any website.

## Extensions

| Browser | Manifest | Status | Install |
|---------|----------|--------|---------|
| [Chrome](chrome/) | V3 | Coming soon | [Chrome Web Store](#) |
| [Firefox](firefox/) | V2 | Coming soon | [Firefox Add-ons](#) |
| [Opera](opera/) | V3 | Coming soon | [Opera Add-ons](#) |

## Features

- **One-Click Access** - Toolbar button or keyboard shortcut
- **Right-Click Context Menu** - "View Page Source" on any page
- **Smart Analysis** - SEO audit covering meta tags, Open Graph, structured data, links, resources, and security indicators
- **Technology Detection** - Identify 100+ technologies including CMS, frameworks, analytics, CDNs, and more
- **Performance Metrics** - DNS, TCP, TLS, server response, and download times
- **Quick Settings** - Syntax highlighting and word wrap preferences
- **Privacy-Focused** - Minimal permissions, no data collection

## How It Works

1. Click the extension icon, right-click a page, or use the keyboard shortcut
2. A new tab opens on [view-page-source.com](https://www.view-page-source.com) with the source code and analysis loaded

The extension itself doesn't fetch or process source code — it sends the URL to the website, which handles all the analysis server-side.

## Development

Each browser has its own directory with a self-contained extension:

```
chrome/     Chrome/Chromium (Manifest V3)
firefox/    Firefox (Manifest V2)
opera/      Opera (Manifest V3)
```

See each browser's README for installation and development instructions.

## Privacy

Each extension includes a detailed privacy policy. In short:
- Only the URL you choose to analyze is sent to view-page-source.com
- No browsing history, personal data, or tracking
- Preferences stored locally via browser sync storage

## License

See [LICENSE](LICENSE) for details.
