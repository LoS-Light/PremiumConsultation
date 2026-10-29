export type AppLanguage = 'en' | 'zh-HK';

// Any Chinese locale (any script or region) shows the app's zh-HK copy; everything else shows
// English (SPEC §9), including a value that isn't a language tag ("", "abc"). The language is
// the part before the first separator, in any letter case: language tags ignore case, and
// Android can report underscores ("zh_TW").
export function resolveLanguage(languageTag: string): AppLanguage {
  const [primaryLanguage] = languageTag.toLowerCase().split(/[-_]/);
  return primaryLanguage === 'zh' ? 'zh-HK' : 'en';
}
