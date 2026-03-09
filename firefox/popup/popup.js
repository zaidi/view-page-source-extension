// View Page Source - Firefox Popup Script

const WEBSITE_URL = 'https://www.view-page-source.com';

let currentUrl = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (tab && tab.url) {
      currentUrl = tab.url;
      displayCurrentUrl(currentUrl);

      // Check if URL is valid
      if (!isValidUrl(currentUrl)) {
        showError('Cannot view source for this page. Only HTTP and HTTPS pages are supported.');
        document.getElementById('view-source-btn').disabled = true;
      }
    } else {
      showError('Unable to get current page URL.');
      document.getElementById('view-source-btn').disabled = true;
    }

    // Load saved settings
    await loadSettings();

    // Add event listeners
    document.getElementById('view-source-btn').addEventListener('click', handleViewSource);
    document.getElementById('stylize-toggle').addEventListener('change', saveSettings);
    document.getElementById('wordwrap-toggle').addEventListener('change', saveSettings);

  } catch (error) {
    console.error('Popup initialization error:', error);
    showError('Error initializing popup.');
  }
});

/**
 * Displays the current URL in the popup
 * @param {string} url - The URL to display
 */
function displayCurrentUrl(url) {
  const urlElement = document.getElementById('current-url');

  // Truncate very long URLs for display
  if (url.length > 60) {
    try {
      const parsed = new URL(url);
      urlElement.textContent = parsed.hostname + parsed.pathname.substring(0, 30) + '...';
      urlElement.title = url;
    } catch (e) {
      urlElement.textContent = url.substring(0, 60) + '...';
      urlElement.title = url;
    }
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

  // Block browser internal pages and other unsupported schemes
  const unsupportedSchemes = [
    'about:',
    'chrome://',
    'moz-extension://',
    'resource://',
    'view-source:',
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
 * Handles the View Source button click
 */
async function handleViewSource() {
  if (!currentUrl || !isValidUrl(currentUrl)) {
    showError('Invalid URL');
    return;
  }

  try {
    // Get current settings
    const settings = await getSettings();

    // Construct target URL
    const encodedUrl = encodeURIComponent(currentUrl);
    let targetUrl = `${WEBSITE_URL}/?url=${encodedUrl}&autorun=true`;

    // Add settings to URL
    if (settings.stylize) {
      targetUrl += '&stylize=true';
    }
    if (settings.wordwrap) {
      targetUrl += '&wrap=true';
    }

    // Open in new tab
    await browser.tabs.create({
      url: targetUrl,
      active: true
    });

    // Close popup after opening
    window.close();

  } catch (error) {
    console.error('Error opening source viewer:', error);
    showError('Failed to open source viewer.');
  }
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
  const settings = {
    stylize: document.getElementById('stylize-toggle').checked,
    wordwrap: document.getElementById('wordwrap-toggle').checked
  };

  try {
    await browser.storage.sync.set({ settings });
  } catch (error) {
    // Fall back to local storage if sync is not available
    await browser.storage.local.set({ settings });
  }
}

/**
 * Gets settings from storage
 * @returns {Promise<Object>} - Settings object
 */
async function getSettings() {
  try {
    let result = await browser.storage.sync.get('settings');

    // Fall back to local storage if sync returns nothing
    if (!result.settings) {
      result = await browser.storage.local.get('settings');
    }

    return result.settings || {
      stylize: true,
      wordwrap: false
    };
  } catch (error) {
    // Return defaults on error
    return {
      stylize: true,
      wordwrap: false
    };
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
