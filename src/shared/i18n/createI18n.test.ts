import { createI18n } from './createI18n';

describe('createI18n', () => {
  test('a string missing from zh-HK shows its English text', () => {
    const i18n = createI18n('zh-HK');
    i18n.addResource('en', 'translation', 'test.onlyInEnglish', 'Only in English');

    expect(i18n.t('test.onlyInEnglish')).toBe('Only in English');
  });
});
