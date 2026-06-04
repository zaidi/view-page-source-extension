// View Page Source - Options Script

const DEFAULTS = {
  stylize: true,
  wordwrap: false,
  defaultTool: 'source',
  toolbarAction: 'popup'
};

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

/**
 * Reads settings merged over the defaults
 * @returns {Promise<Object>}
 */
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    return { ...DEFAULTS, ...(result.settings || {}) };
  } catch (error) {
    return { ...DEFAULTS };
  }
}

/**
 * Merges a patch into the saved settings and persists it
 * @param {Object} patch
 */
async function save(patch) {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...patch } });
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

  document.getElementById('default-tool').value = settings.defaultTool;
  const toolbarRadio = document.querySelector(`input[name="toolbar"][value="${settings.toolbarAction}"]`);
  if (toolbarRadio) toolbarRadio.checked = true;
  document.getElementById('stylize').checked = settings.stylize;
  document.getElementById('wordwrap').checked = settings.wordwrap;

  document.getElementById('default-tool').addEventListener('change', (e) => {
    save({ defaultTool: e.target.value });
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
