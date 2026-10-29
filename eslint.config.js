// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'assets/*'],
  },
  {
    // Naming conventions from SPEC §12a. Rules that need type information
    // (e.g. boolean prefixes) are left to review.
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Import modules and assets with `import`, which TypeScript checks; `require` returns `any`.
      // Expo's config allows `require` for assets (images, fonts); this takes that exception out.
      '@typescript-eslint/no-require-imports': ['error', { allow: [] }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'import', format: null },
        // Components are PascalCase; module-level constants are UPPER_CASE.
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        // Object keys follow external shapes (styles, i18n keys, headers, JSON).
        {
          selector: ['objectLiteralProperty', 'objectLiteralMethod', 'typeProperty'],
          format: null,
        },
      ],
    },
  },
  // Turn off formatting rules that conflict with Prettier; Prettier runs separately.
  prettierConfig,
]);
