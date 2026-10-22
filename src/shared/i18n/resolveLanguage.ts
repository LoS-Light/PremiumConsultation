export type AppLanguage = 'en' | 'zh-HK';

// Any Chinese locale (any script or region) shows the app's zh-HK copy; everything else
// shows English (SPEC §9).
export function resolveLanguage(languageTag: string): AppLanguage {
  const [primaryLanguage] = languageTag.split('-');
  return primaryLanguage === 'zh' ? 'zh-HK' : 'en';
}
