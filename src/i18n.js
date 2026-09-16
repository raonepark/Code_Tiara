import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko.json';
import en from './locales/en.json';

// Language rule (design-system §10-6):
//   - no explicit choice yet  → follow the OS language on every launch (navigator.language)
//   - user picked one in Settings → LANGUAGE_KEY in localStorage wins from then on
//   - OS language we don't ship (anything but ko/en) → English
// Only Settings writes LANGUAGE_KEY; the detector itself never caches, otherwise the
// first detected value would freeze the app to whatever the OS was on day one.
export const LANGUAGE_KEY = 'lumora_language';
export const SUPPORTED_LANGUAGES = ['ko', 'en'];

const baseLang = (lng) => (lng || '').toLowerCase().split('-')[0];

// Older builds let the detector cache under 'i18nextLng' on first launch, so that key
// exists for everyone. Keep it only when it differs from the OS language — that is
// the one case where the user must have chosen it on purpose.
try {
  const legacy = localStorage.getItem('i18nextLng');
  if (legacy) {
    if (!localStorage.getItem(LANGUAGE_KEY) && baseLang(legacy) !== baseLang(navigator.language) && SUPPORTED_LANGUAGES.includes(baseLang(legacy))) {
      localStorage.setItem(LANGUAGE_KEY, baseLang(legacy));
    }
    localStorage.removeItem('i18nextLng');
  }
} catch (e) { /* storage unavailable — fall through to detection */ }

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true, // 'ko-KR' → ko, 'en-GB' → en
    load: 'languageOnly',
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: [] // Settings is the only writer
    },
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Keep <html lang> honest for spellcheck / screen readers.
const syncHtmlLang = (lng) => { document.documentElement.lang = baseLang(lng) || 'en'; };
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

/** Persist an explicit user choice and switch. Other windows follow via the storage event (App.js). */
export const setUserLanguage = (lng) => {
  const lang = SUPPORTED_LANGUAGES.includes(baseLang(lng)) ? baseLang(lng) : 'en';
  try { localStorage.setItem(LANGUAGE_KEY, lang); } catch (e) { /* ignore */ }
  return i18n.changeLanguage(lang);
};

export default i18n;
