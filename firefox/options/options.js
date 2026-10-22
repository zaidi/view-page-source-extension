// View Page Source - Firefox Options Script
// DEFAULT_SETTINGS and SITE_LANGUAGES come from tools.js

// Short alias for the i18n lookup
const t = (key) => browser.i18n.getMessage(key);

/**
 * Replaces the text of every [data-i18n] element with its localized message
 */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const msg = t(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
}

/**
 * Reads settings merged over the defaults
 * @returns {Promise<Object>}
 */
async function getSettings() {
  try {
    const result = await browser.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Merges a patch into the saved settings and persists it
 * @param {Object} patch
 */
async function save(patch) {
  const current = await getSettings();
  await browser.storage.sync.set({ settings: { ...current, ...patch } });
  flashSaved();
}

let savedTimer;
function flashSaved() {
  const el = document.getElementById('status');
  el.classList.add('show');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => el.classList.remove('show'), 1200);
}

document.addEventListener('DOMContentLoaded', async () => {
  applyI18n();
  const settings = await getSettings();

  // One option per website language, after "Same as the browser"
  const languageSelect = document.getElementById('site-language');
  for (const [code, name] of Object.entries(SITE_LANGUAGES)) {
    const option = document.createElement('option');
    option.value = code;
    option.lang = code;
    option.textContent = name;
    languageSelect.appendChild(option);
  }

  document.getElementById('default-tool').value = settings.defaultTool;
  languageSelect.value = settings.siteLanguage;
  const toolbarRadio = document.querySelector(`input[name="toolbar"][value="${settings.toolbarAction}"]`);
  if (toolbarRadio) toolbarRadio.checked = true;
  document.getElementById('stylize').checked = settings.stylize;
  document.getElementById('wordwrap').checked = settings.wordwrap;

  document.getElementById('default-tool').addEventListener('change', (e) => {
    save({ defaultTool: e.target.value });
  });
  languageSelect.addEventListener('change', (e) => {
    save({ siteLanguage: e.target.value });
  });
  document.querySelectorAll('input[name="toolbar"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) save({ toolbarAction: e.target.value });
    });
  });
  document.getElementById('stylize').addEventListener('change', (e) => {
    save({ stylize: e.target.checked });
  });
  document.getElementById('wordwrap').addEventListener('change', (e) => {
    save({ wordwrap: e.target.checked });
  });
});
