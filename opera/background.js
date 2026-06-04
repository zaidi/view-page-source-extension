// View Page Source - Opera Extension Background Service Worker

const WEBSITE_URL = 'https://www.view-page-source.com';

// Short alias for the i18n lookup
const t = (key) => chrome.i18n.getMessage(key);

// Tools we can deep-link into. `formatting` = the page honours stylize/wrap.
const TOOLS = {
  source:  { path: '/',                title: t('toolSource'),  formatting: true  },
  seo:     { path: '/seo-checker/',    title: t('toolSeo'),     formatting: false },
  social:  { path: '/social-preview/', title: t('toolSocial'),  formatting: false },
  extract: { path: '/html-extractor/', title: t('toolExtract'), formatting: true  }
};

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
        title: TOOLS[key].title,
        contexts: ['page', 'frame'],
        documentUrlPatterns: URL_PATTERNS
      });
      chrome.contextMenus.create({
        id: `link:${key}`,
        parentId: 'link',
        title: TOOLS[key].title,
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
  const tool = TOOLS[key];
  if (!tool) return;

  let url;
  if (scope === 'link') {
    url = info.linkUrl;
  } else if (scope === 'image') {
    url = info.srcUrl;
  } else {
    // page/frame: prefer the frame URL when the click was inside an iframe
    url = info.frameUrl || (tab && tab.url);
  }
  openTool(tool, url);
});

// Extra keyboard commands mapped to tools (users assign keys in the browser settings)
const COMMAND_TOOLS = {
  'view-seo': 'seo',
  'view-social': 'social',
  'view-extract': 'extract'
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
      openTool(TOOLS[COMMAND_TOOLS[command]], tab.url);
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
  openTool(TOOLS[settings.defaultTool] || TOOLS.source, url);
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

/**
 * Shows the HTTP status code on the toolbar badge for a tab
 * @param {number} tabId
 * @param {number} httpCode
 */
function setStatusBadge(tabId, httpCode) {
  if (!tabId || !httpCode) return;
  const color = httpCode < 300 ? '#2e7d32' : httpCode < 400 ? '#f9a825' : '#c62828';
  try {
    chrome.action.setBadgeBackgroundColor({ tabId, color });
    chrome.action.setBadgeText({ tabId, text: String(httpCode) });
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
 * @param {Object} tool - One of the TOOLS entries
 * @param {string} url - The URL to analyze
 */
async function openTool(tool, url) {
  if (!isValidUrl(url)) {
    console.error('Cannot view source for this page:', url);
    return;
  }

  const encodedUrl = encodeURIComponent(url);
  let targetUrl = `${WEBSITE_URL}${tool.path}?url=${encodedUrl}&autorun=true`;

  // Only the source/extractor pages honour formatting preferences
  if (tool.formatting) {
    const settings = await getSettings();
    if (settings.stylize) {
      targetUrl += '&stylize=true';
    }
    if (settings.wordwrap) {
      targetUrl += '&wrap=true';
    }
  }

  await addToHistory(url);
  chrome.tabs.create({ url: targetUrl, active: true });
}

/**
 * Gets the user's saved preferences, falling back to defaults
 * @returns {Promise<Object>}
 */
const DEFAULT_SETTINGS = {
  stylize: true,
  wordwrap: false,
  defaultTool: 'source',
  toolbarAction: 'popup'
};

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

  // Block browser internal pages and other unsupported schemes
  const unsupportedSchemes = [
    'chrome://',
    'chrome-extension://',
    'opera://',
    'about:',
    'edge://',
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
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || t('errAnalysisFailed') };
    }

    // Record successful analyses in recent history
    await addToHistory(url);

    const server = data.serverInfo || {};
    const page = data.pageInfo || {};

    // Reflect the HTTP status on the toolbar badge for the active tab
    if (server.httpCode) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) setStatusBadge(tabs[0].id, server.httpCode);
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
