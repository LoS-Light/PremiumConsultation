import { resolveLanguage } from './resolveLanguage';

describe('resolveLanguage', () => {
  test('a Hong Kong Chinese device shows Chinese', () => {
    expect(resolveLanguage('zh-Hant-HK')).toBe('zh-HK');
  });

  test.each(['zh-Hant-TW', 'zh-Hant-MO', 'zh-Hans-CN', 'zh-Hans-SG', 'zh'])(
    'every Chinese device shows Chinese: %s',
    (languageTag) => {
      expect(resolveLanguage(languageTag)).toBe('zh-HK');
    },
  );

  // Language tags ignore letter case, and Android can report underscores.
  test.each(['zh_TW', 'zh_Hant_TW', 'ZH-TW', 'Zh-hANT-tw'])(
    'a Chinese tag in any letter case or with underscores shows Chinese: %s',
    (languageTag) => {
      expect(resolveLanguage(languageTag)).toBe('zh-HK');
    },
  );

  test('an English device shows English', () => {
    expect(resolveLanguage('en-US')).toBe('en');
  });

  test.each(['en-GB', 'ja-JP', 'fr-FR', 'zha-CN', 'EN_us'])(
    'every other device falls back to English: %s',
    (languageTag) => {
      expect(resolveLanguage(languageTag)).toBe('en');
    },
  );

  test.each(['', ' ', 'abc', '123', 'chinese', 'not a tag'])(
    'a value that is not a language tag shows English: "%s"',
    (languageTag) => {
      expect(resolveLanguage(languageTag)).toBe('en');
    },
  );
});
