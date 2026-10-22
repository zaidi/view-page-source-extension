// View Page Source - Shared tool definitions (background, popup and options)

const WEBSITE_URL = 'https://www.view-page-source.com';

// Tools we can deep-link into. `msg` = i18n key for the name,
// `formatting` = the page honours stylize/wrap.
const TOOLS = {
  source:   { msg: 'toolSource',   formatting: true  },
  seo:      { msg: 'toolSeo',      formatting: false },
  headers:  { msg: 'toolHeaders',  formatting: false },
  social:   { msg: 'toolSocial',   formatting: false },
  extract:  { msg: 'toolExtract',  formatting: true  },
  download: { msg: 'toolDownload', formatting: false }
};

// Path of every tool in each language the website is published in
// (mirrors the site's hreflang alternates).
const TOOL_PATHS = {
  en: { source: '/',    seo: '/seo-checker/',     headers: '/headers-check/',               social: '/social-preview/',           extract: '/html-extractor/',      download: '/download-website-code/' },
  ar: { source: '/ar/', seo: '/ar/seo-checker/',  headers: '/ar/headers-check/',            social: '/ar/social-preview/',        extract: '/ar/html-extractor/',   download: '/ar/download-website-code/' },
  de: { source: '/de/', seo: '/de/seo-check/',    headers: '/de/http-header-pruefen/',      social: '/de/social-media-vorschau/', extract: '/de/html-extraktor/',   download: '/de/website-code-herunterladen/' },
  es: { source: '/es/', seo: '/es/analisis-seo/', headers: '/es/verificar-cabeceras-http/', social: '/es/vista-previa-social/',   extract: '/es/extractor-de-html/', download: '/es/descargar-codigo-web/' },
  fr: { source: '/fr/', seo: '/fr/analyse-seo/',  headers: '/fr/verifier-en-tetes-http/',   social: '/fr/apercu-social/',         extract: '/fr/extracteur-html/',  download: '/fr/telecharger-code-source-web/' },
  id: { source: '/id/', seo: '/id/cek-seo/',      headers: '/id/periksa-header-http/',      social: '/id/pratinjau-sosial/',      extract: '/id/ekstraktor-html/',  download: '/id/unduh-kode-sumber-website/' },
  it: { source: '/it/', seo: '/it/analisi-seo/',  headers: '/it/verifica-intestazioni-http/', social: '/it/anteprima-social/',    extract: '/it/estrattore-html/',  download: '/it/scarica-codice-sito-web/' },
  ja: { source: '/ja/', seo: '/ja/seo-checker/',  headers: '/ja/http-header-checker/',      social: '/ja/social-preview/',        extract: '/ja/html-extractor/',   download: '/ja/website-code-download/' },
  nl: { source: '/nl/', seo: '/nl/seo-check/',    headers: '/nl/http-headers-controleren/', social: '/nl/social-media-voorbeeld/', extract: '/nl/html-extractor/',  download: '/nl/website-code-downloaden/' },
  pl: { source: '/pl/', seo: '/pl/analiza-seo/',  headers: '/pl/sprawdz-naglowki-http/',    social: '/pl/podglad-social-media/',  extract: '/pl/ekstraktor-html/',  download: '/pl/pobierz-kod-strony-www/' },
  pt: { source: '/pt/', seo: '/pt/analise-seo/',  headers: '/pt/verificar-cabecalhos-http/', social: '/pt/previa-social/',       extract: '/pt/extrator-de-html/', download: '/pt/baixar-codigo-do-site/' },
  tr: { source: '/tr/', seo: '/tr/seo-analizi/',  headers: '/tr/http-baslik-denetleyici/',  social: '/tr/sosyal-medya-onizleme/', extract: '/tr/html-ayiklayici/',  download: '/tr/web-sitesi-kodunu-indir/' }
};

// Language names for the options page, in their own language (so not translated)
const SITE_LANGUAGES = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  tr: 'Türkçe'
};

const DEFAULT_SETTINGS = {
  stylize: true,
  wordwrap: false,
  defaultTool: 'source',
  toolbarAction: 'popup',
  siteLanguage: 'auto'
};

/**
 * Picks the website language: the saved choice, or else the browser's UI
 * language when the site is published in it, or else English
 * @param {string} setting - 'auto' or a TOOL_PATHS key
 * @param {string} uiLanguage - e.g. 'pt-BR'
 * @returns {string}
 */
function resolveSiteLanguage(setting, uiLanguage) {
  if (setting && setting !== 'auto' && TOOL_PATHS[setting]) return setting;
  const base = String(uiLanguage || '').toLowerCase().split(/[-_]/)[0];
  return TOOL_PATHS[base] ? base : 'en';
}

/**
 * Builds the view-page-source.com link that runs a tool on a URL
 * @param {string} toolKey - Key into TOOLS
 * @param {string} url - The URL to analyze
 * @param {Object} settings - Saved settings, merged over DEFAULT_SETTINGS
 * @param {string} uiLanguage - The browser's UI language
 * @returns {string}
 */
function buildToolUrl(toolKey, url, settings, uiLanguage) {
  const key = TOOLS[toolKey] ? toolKey : 'source';
  const lang = resolveSiteLanguage(settings.siteLanguage, uiLanguage);
  let targetUrl = `${WEBSITE_URL}${TOOL_PATHS[lang][key]}?url=${encodeURIComponent(url)}&autorun=true`;

  // Only the source/extractor pages honour formatting preferences
  if (TOOLS[key].formatting) {
    if (settings.stylize) {
      targetUrl += '&stylize=true';
    }
    if (settings.wordwrap) {
      targetUrl += '&wrap=true';
    }
  }
  return targetUrl;
}
