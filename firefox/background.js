// View Page Source - Firefox Extension Background Script

const WEBSITE_URL = 'https://www.view-page-source.com';

// Create context menu on install
browser.runtime.onInstalled.addListener(() => {
  // Create context menu item
  browser.contextMenus.create({
    id: 'view-page-source',
    title: 'View Page Source',
    contexts: ['page', 'frame']
  });

  console.log('View Page Source extension installed');
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'view-page-source') {
    openSourceViewer(tab.url || info.frameUrl);
  }
});

/**
 * Opens the View Page Source website with the specified URL
 * @param {string} url - The URL to view source for
 */
function openSourceViewer(url) {
  // Validate URL
  if (!isValidUrl(url)) {
    console.error('Invalid URL:', url);
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'View Page Source',
      message: 'Cannot view source for this page. Only HTTP and HTTPS pages are supported.'
    });
    return;
  }

  // Construct target URL with parameters
  const encodedUrl = encodeURIComponent(url);
  const targetUrl = `${WEBSITE_URL}/?url=${encodedUrl}&autorun=true`;

  // Open in new tab
  browser.tabs.create({
    url: targetUrl,
    active: true
  });
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

// Update icon state based on current tab
browser.tabs.onActivated.addListener((activeInfo) => {
  updateIconState(activeInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateIconState(tabId);
  }
});

/**
 * Updates the extension icon state based on whether the page is viewable
 * @param {number} tabId - The tab ID to update
 */
async function updateIconState(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    const isValid = isValidUrl(tab.url);

    // Update icon
    await browser.browserAction.setIcon({
      tabId: tabId,
      path: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png'
      }
    });

    // Update title with helpful text
    if (isValid) {
      await browser.browserAction.setTitle({
        tabId: tabId,
        title: 'View Page Source (Ctrl+Shift+Y)'
      });
    } else {
      await browser.browserAction.setTitle({
        tabId: tabId,
        title: 'View Page Source (not available for this page)'
      });
    }
  } catch (error) {
    // Tab may have been closed
    console.debug('Could not update icon state:', error.message);
  }
}
