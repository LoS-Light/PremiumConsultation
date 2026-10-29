import { createInstance, type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zhHK from './locales/zh-HK.json';
import type { AppLanguage } from './resolveLanguage';

export function createI18n(language: AppLanguage): i18n {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    resources: { en: { translation: en }, 'zh-HK': { translation: zhHK } },
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
