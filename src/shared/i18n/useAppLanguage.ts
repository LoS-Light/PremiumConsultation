import { useLocales } from 'expo-localization';
import { useEffect, useState } from 'react';
import type { i18n } from 'i18next';

import { createI18n } from './createI18n';
import { resolveLanguage } from './resolveLanguage';

// The app's i18n instance, kept in step with the device language (SPEC §9).
// useLocales re-renders when the device language changes.
export function useAppLanguage(): i18n {
  const language = resolveLanguage(useLocales()[0]?.languageTag ?? 'en');
  const [instance] = useState(() => createI18n(language));

  useEffect(() => {
    if (instance.language !== language) {
      void instance.changeLanguage(language);
    }
  }, [instance, language]);

  return instance;
}
