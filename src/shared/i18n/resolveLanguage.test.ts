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

  test('an English device shows English', () => {
    expect(resolveLanguage('en-US')).toBe('en');
  });

  test.each(['en-GB', 'ja-JP', 'fr-FR', 'zha-CN'])(
    'every other device falls back to English: %s',
    (languageTag) => {
      expect(resolveLanguage(languageTag)).toBe('en');
    },
  );
});
