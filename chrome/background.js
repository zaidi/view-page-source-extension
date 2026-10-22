// View Page Source - Chrome Extension Background Service Worker

// WEBSITE_URL, TOOLS, DEFAULT_SETTINGS and buildToolUrl()
importScripts('tools.js');

// Short alias for the i18n lookup
const t = (key) => chrome.i18n.getMessage(key);

// Only http/https targets are analyzable
const URL_PATTERNS = ['http://*/*', 'https://*/*'];

// Create the context menus on install
chrome.runtime.onInstalled.addListener(() => {
  // Remove any stale items first to avoid duplicate-id errors on update/reinstall
  chrome.contextMenus.removeAll(() => {
    // Right-click the page (or a frame) to run a tool on the current URL
    chrome.contextMenus.create({
      id: 'page',
      title: t('menuPageParent'),
      contexts: ['page', 'frame'],
      documentUrlPatterns: URL_PATTERNS
    });
    // Right-click a link to run a tool on the link's target
    chrome.contextMenus.create({
      id: 'link',
      title: t('menuLinkParent'),
      contexts: ['link'],
      targetUrlPatterns: URL_PATTERNS
    });
    for (const key of Object.keys(TOOLS)) {
      chrome.contextMenus.create({
        id: `page:${key}`,
        parentId: 'page',
        title: t(TOOLS[key].msg),
        contexts: ['page', 'frame'],
        documentUrlPatterns: URL_PATTERNS
      });
      chrome.contextMenus.create({
        id: `link:${key}`,
        parentId: 'link',
        title: t(TOOLS[key].msg),
        contexts: ['link'],
        targetUrlPatterns: URL_PATTERNS
      });
    }
    // Right-click an image to inspect that image resource's source/headers
    chrome.contextMenus.create({
      id: 'image:source',
      title: t('menuImageSource'),
      contexts: ['image'],
      targetUrlPatterns: URL_PATTERNS
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const [scope, key] = String(info.menuItemId).split(':');
  if (!TOOLS[key]) return;

  let url;
  if (scope === 'link') {
    url = info.linkUrl;
  } else if (scope === 'image') {
    url = info.srcUrl;
  } else {
    // page/frame: prefer the frame URL when the click was inside an iframe
    url = info.frameUrl || (tab && tab.url);
  }
  openTool(key, url);
});

// Extra keyboard commands mapped to tools (users assign keys in the browser settings)
const COMMAND_TOOLS = {
  'view-seo': 'seo',
  'view-headers': 'headers',
  'view-social': 'social',
  'view-extract': 'extract',
  'view-download': 'download'
};

// Handle keyboard shortcuts: view-source runs the default tool; the rest
// run their specific tool on the active tab
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;
    if (command === 'view-source') {
      runDefaultTool(tab.url);
    } else if (COMMAND_TOOLS[command]) {
      openTool(COMMAND_TOOLS[command], tab.url);
    }
  });
});

// ---- Toolbar click behavior (popup vs. instant) ----

/**
 * Runs the user's chosen default tool on a URL
 * @param {string} url
 */
async function runDefaultTool(url) {
  const settings = await getSettings();
  openTool(settings.defaultTool, url);
}

/**
 * Applies the saved toolbar-click behavior. Clearing the popup lets
 * action.onClicked fire ("instant"); setting it restores the popup.
 */
async function applyToolbarAction() {
  const settings = await getSettings();
  const popup = settings.toolbarAction === 'instant' ? '' : 'popup/popup.html';
  try {
    await chrome.action.setPopup({ popup });
  } catch (error) {
    // ignore
  }
}

chrome.runtime.onInstalled.addListener(applyToolbarAction);
chrome.runtime.onStartup.addListener(applyToolbarAction);

// Re-apply whenever settings change (e.g. from the options page)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.settings) {
    applyToolbarAction();
  }
});

// Fires only in "instant" mode (when the popup has been cleared)
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.url) {
    runDefaultTool(tab.url);
  }
});

// ---- Toolbar status badge ----

// Badge colours: green = fetched OK, amber = redirect or "try again later",
// red = the page could not be fetched. All dark enough for the white badge text.
const BADGE_OK = '#2e7d32';
const BADGE_WAIT = '#a15c00';
const BADGE_FAIL = '#c62828';

/**
 * Shows a Quick Look outcome on the toolbar badge for a tab
 * @param {number} tabId
 * @param {string} text - At most 4 characters fit
 * @param {string} color
 */
function setStatusBadge(tabId, text, color) {
  if (!tabId || !text) return;
  try {
    chrome.action.setBadgeBackgroundColor({ tabId, color });
    chrome.action.setBadgeText({ tabId, text });
  } catch (error) {
    // ignore
  }
}

/**
 * Badge colour for an HTTP status code
 * @param {number} httpCode
 * @returns {string}
 */
function statusColor(httpCode) {
  return httpCode < 300 ? BADGE_OK : httpCode < 400 ? BADGE_WAIT : BADGE_FAIL;
}

/**
 * Sets the badge on the active tab (the one the popup's Quick Look ran on)
 * @param {string} text
 * @param {string} color
 */
async function setActiveTabBadge(text, color) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) setStatusBadge(tabs[0].id, text, color);
  } catch (error) {
    // ignore
  }
}

// Clear the badge when the tab starts navigating
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
});

/**
 * Opens the given tool on view-page-source.com for the specified URL
 * @param {string} toolKey - Key into TOOLS
 * @param {string} url - The URL to analyze
 */
async function openTool(toolKey, url) {
  if (!isValidUrl(url)) {
    console.error('Cannot view source for this page:', url);
    return;
  }

  const settings = await getSettings();
  const targetUrl = buildToolUrl(toolKey, url, settings, chrome.i18n.getUILanguage());

  await addToHistory(url);
  chrome.tabs.create({ url: targetUrl, active: true });
}

/**
 * Gets the user's saved preferences, falling back to defaults
 * @returns {Promise<Object>}
 */
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

// ---- Recent history (stored locally; shared with the popup) ----

const HISTORY_KEY = 'history';
const HISTORY_MAX = 10;

/**
 * Records a URL at the top of the recent-history list
 * @param {string} url
 */
async function addToHistory(url) {
  try {
    const store = await chrome.storage.local.get(HISTORY_KEY);
    const list = Array.isArray(store[HISTORY_KEY]) ? store[HISTORY_KEY] : [];
    const next = [url, ...list.filter((u) => u !== url)].slice(0, HISTORY_MAX);
    await chrome.storage.local.set({ [HISTORY_KEY]: next });
  } catch (error) {
    // History is best-effort; ignore storage failures
  }
}

/**
 * Validates if the URL is viewable
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUrl(url) {
  if (!url) return false;

  // Block chrome internal pages and other unsupported schemes
  const unsupportedSchemes = [
    'chrome://',
    'chrome-extension://',
    'about:',
    'edge://',
    'opera://',
    'brave://',
    'vivaldi://',
    'data:',
    'javascript:',
    'file://'
  ];

  for (const scheme of unsupportedSchemes) {
    if (url.startsWith(scheme)) {
      return false;
    }
  }

  // Only allow HTTP and HTTPS
  return url.startsWith('http://') || url.startsWith('https://');
}

// ---- Inline "Quick Look" analysis (requested by the popup) ----

// Run analysis in the background so host_permissions apply and the request
// isn't subject to the site's CORS policy.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'quick-look' && msg.url) {
    quickLook(msg.url).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
});

/**
 * Fetches and summarizes a URL via the view-page-source.com API
 * @param {string} url
 * @returns {Promise<Object>} { ok, result } or { ok: false, error }
 */
async function quickLook(url) {
  if (!isValidUrl(url)) {
    return { ok: false, error: t('errCannotAnalyze') };
  }

  try {
    const tokenRes = await fetch(`${WEBSITE_URL}/api/token`);
    if (!tokenRes.ok) {
      return { ok: false, error: t('errAuth') };
    }
    const { token } = await tokenRes.json();

    const res = await fetch(`${WEBSITE_URL}/api/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, token, stylize: false })
    });
    // Nginx answers its own 429/5xx with an HTML page, not JSON
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // 429 = our own rate limit or the site's fetch budget: retrying later works.
      // Anything else means the page itself could not be fetched.
      if (res.status === 429) {
        await setActiveTabBadge('WAIT', BADGE_WAIT);
      } else {
        await setActiveTabBadge('ERR', BADGE_FAIL);
      }
      return { ok: false, error: data.error || t('errAnalysisFailed') };
    }

    // Record successful analyses in recent history
    await addToHistory(url);

    const server = data.serverInfo || {};
    const page = data.pageInfo || {};

    // Reflect the HTTP status on the toolbar badge for the active tab
    if (server.httpCode) {
      await setActiveTabBadge(String(server.httpCode), statusColor(server.httpCode));
    }

    return {
      ok: true,
      result: {
        httpCode: server.httpCode,
        httpVersion: server.httpVersion,
        totalSize: page.totalSize,
        tagCount: page.tagCount,
        totalWords: page.totalWords,
        generators: page.generators,
        title: extractTitle(data.html)
      }
    };
  } catch (error) {
    return { ok: false, error: t('errNetwork') };
  }
}

/**
 * Extracts the <title> from raw HTML (no DOM in the service worker)
 * @param {string} html
 * @returns {string}
 */
function extractTitle(html) {
  if (!html) return '';
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return '';
  return decodeEntities(match[1].replace(/\s+/g, ' ').trim());
}

/**
 * Decodes the common HTML entities that show up in titles
 * @param {string} str
 * @returns {string}
 */
function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
