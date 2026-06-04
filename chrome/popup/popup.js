// View Page Source - Popup Script

const WEBSITE_URL = 'https://www.view-page-source.com';

// Tools the popup can launch. `formatting` = the page honours stylize/wrap.
const TOOLS = {
  source:  { path: '/',                formatting: true  },
  seo:     { path: '/seo-checker/',    formatting: false },
  social:  { path: '/social-preview/', formatting: false },
  extract: { path: '/html-extractor/', formatting: true  }
};

let currentUrl = '';

// Short alias for the i18n lookup
const t = (key) => chrome.i18n.getMessage(key);

/**
 * Replaces the text of every [data-i18n] element with its localized message
 */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const msg = t(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  applyI18n();

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url) {
    currentUrl = tab.url;
    displayCurrentUrl(currentUrl);

    // Check if URL is valid
    if (!isValidUrl(currentUrl)) {
      showError(t('errUnsupportedPage'));
      disableActions();
    }
  } else {
    showError(t('errNoUrl'));
    disableActions();
  }

  // Load saved settings
  loadSettings();

  // Wire every tool button (primary + secondary) via its data-tool attribute
  document.querySelectorAll('[data-tool]').forEach((btn) => {
    btn.addEventListener('click', () => openTool(btn.dataset.tool));
  });
  document.getElementById('quick-look-btn').addEventListener('click', quickLook);
  document.getElementById('stylize-toggle').addEventListener('change', saveSettings);
  document.getElementById('wordwrap-toggle').addEventListener('change', saveSettings);
  document.getElementById('history-clear').addEventListener('click', clearHistory);

  // Populate the recent-history list
  renderHistory();
});

/**
 * Disables all tool buttons (used when the page can't be analyzed)
 */
function disableActions() {
  document.querySelectorAll('[data-tool], #quick-look-btn').forEach((btn) => {
    btn.disabled = true;
  });
}

/**
 * Displays the current URL in the popup
 * @param {string} url - The URL to display
 */
function displayCurrentUrl(url) {
  const urlElement = document.getElementById('current-url');

  // Truncate very long URLs for display
  if (url.length > 60) {
    const parsed = new URL(url);
    urlElement.textContent = parsed.hostname + parsed.pathname.substring(0, 30) + '...';
    urlElement.title = url;
  } else {
    urlElement.textContent = url;
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

/**
 * Opens the selected tool for the current URL
 * @param {string} toolId - Key into TOOLS
 */
async function openTool(toolId, url = currentUrl) {
  const tool = TOOLS[toolId];
  if (!tool) return;

  if (!url || !isValidUrl(url)) {
    showError(t('errInvalidUrl'));
    return;
  }

  // Construct target URL
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

  // Remember this URL before the popup closes
  await addToHistory(url);

  // Open in new tab
  chrome.tabs.create({
    url: targetUrl,
    active: true
  });

  // Close popup after opening
  window.close();
}

/**
 * Runs an inline "Quick Look" analysis via the background service worker
 */
async function quickLook() {
  if (!currentUrl || !isValidUrl(currentUrl)) {
    showError(t('errInvalidUrl'));
    return;
  }

  const btn = document.getElementById('quick-look-btn');
  const pane = document.getElementById('quick-results');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('popupAnalyzing');
  pane.hidden = true;
  clearStatus();

  let response;
  try {
    response = await chrome.runtime.sendMessage({ type: 'quick-look', url: currentUrl });
  } catch (error) {
    response = { ok: false, error: t('errReachService') };
  }

  btn.disabled = false;
  btn.textContent = original;

  if (!response || !response.ok) {
    showError((response && response.error) || t('errQuickLookFailed'));
    return;
  }

  renderQuickResults(response.result);
  pane.hidden = false;

  // The background recorded this URL - refresh the recent list
  renderHistory();
}

/**
 * Renders the Quick Look summary into the results pane
 * @param {Object} r - Result object from the background
 */
function renderQuickResults(r) {
  const status = r.httpCode
    ? (r.httpVersion ? `${r.httpCode} (${r.httpVersion})` : String(r.httpCode))
    : '-';
  setText('q-status', status);
  setText('q-title', r.title || '-');
  setText('q-size', r.totalSize || '-');
  setText('q-tags', (r.tagCount != null) ? r.tagCount.toLocaleString() : '-');
  setText('q-words', (r.totalWords != null) ? r.totalWords.toLocaleString() : '-');

  const genRow = document.getElementById('q-generator-row');
  if (r.generators) {
    setText('q-generator', r.generators);
    genRow.hidden = false;
  } else {
    genRow.hidden = true;
  }
}

/**
 * Sets an element's text content by id
 */
function setText(id, text) {
  document.getElementById(id).textContent = text;
}

/**
 * Clears the status message
 */
function clearStatus() {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = '';
  statusEl.className = 'info';
}

/**
 * Loads settings from storage
 */
async function loadSettings() {
  const settings = await getSettings();

  document.getElementById('stylize-toggle').checked = settings.stylize;
  document.getElementById('wordwrap-toggle').checked = settings.wordwrap;
}

/**
 * Saves settings to storage
 */
async function saveSettings() {
  // Merge with existing settings so options-page values aren't overwritten
  const current = await getSettings();
  const settings = {
    ...current,
    stylize: document.getElementById('stylize-toggle').checked,
    wordwrap: document.getElementById('wordwrap-toggle').checked
  };

  await chrome.storage.sync.set({ settings });
}

/**
 * Gets settings from storage, merged over the defaults
 * @returns {Promise<Object>} - Settings object
 */
async function getSettings() {
  const defaults = { stylize: true, wordwrap: false, defaultTool: 'source', toolbarAction: 'popup' };
  const result = await chrome.storage.sync.get('settings');
  return { ...defaults, ...(result.settings || {}) };
}

// ---- Recent history (stored locally) ----

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
 * Renders the recent-history list, or hides the section when empty
 */
async function renderHistory() {
  const section = document.getElementById('history-section');
  const listEl = document.getElementById('history-list');

  let list = [];
  try {
    const store = await chrome.storage.local.get(HISTORY_KEY);
    list = Array.isArray(store[HISTORY_KEY]) ? store[HISTORY_KEY] : [];
  } catch (error) {
    list = [];
  }

  listEl.textContent = '';
  if (!list.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  list.forEach((url) => {
    const item = document.createElement('button');
    item.className = 'history-item';
    item.type = 'button';
    item.textContent = shortenUrl(url);
    item.title = url;
    item.addEventListener('click', () => openTool('source', url));
    listEl.appendChild(item);
  });
}

/**
 * Clears the recent-history list
 */
async function clearHistory() {
  try {
    await chrome.storage.local.remove(HISTORY_KEY);
  } catch (error) {
    // ignore
  }
  renderHistory();
}

/**
 * Returns a compact, display-friendly form of a URL
 * @param {string} url
 * @returns {string}
 */
function shortenUrl(url) {
  try {
    const u = new URL(url);
    const tail = u.pathname + u.search;
    return u.hostname + (tail.length > 24 ? tail.slice(0, 24) + '...' : tail);
  } catch (error) {
    return url.length > 48 ? url.slice(0, 48) + '...' : url;
  }
}

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = 'info error';
}

/**
 * Shows a success message
 * @param {string} message - The success message to display
 */
function showSuccess(message) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = 'info success';
}

/**
 * Shows a warning message
 * @param {string} message - The warning message to display
 */
function showWarning(message) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = 'info warning';
}
