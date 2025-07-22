import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import jsx11y from 'eslint-plugin-jsx-a11y';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  // JavaScript files
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      import: importPlugin,
      'jsx-a11y': jsx11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'check-file': checkFile,
    },
    rules: {
      'prefer-default-export': 'off',
      'no-duplicate-imports': 'error',
      'react/react-in-jsx-scope': 'off',
      'import/prefer-default-export': 'off',
      'react/function-component-definition': [
        'error',
        { namedComponents: ['arrow-function', 'function-declaration'] },
      ],
      'react/jsx-props-no-spreading': 'warn',
      'react/require-default-props': 'off',
      'react/no-unknown-property': ['error', { ignore: ['global', 'jsx'] }],
      'import/extensions': [
        'error',
        'never',
        {
          json: 'always',
          scss: 'always',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'info', 'error'] }],
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/(?!__tests__$)[^/]+/': 'KEBAB_CASE',
        },
      ],
      'check-file/folder-match-with-fex': [
        'error',
        { '*.spec.{ts,tsx}': '**/__tests__/**' },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{jsx,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'unknown'],
        },
      ],
      // JSX A11y rules
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel'] },
      ],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: [],
          labelAttributes: [],
          controlComponents: [],
          assert: 'both',
          depth: 25,
        },
      ],
    },
  },
  // Component overrides
  {
    files: ['**/App.tsx'],
    rules: {
      'check-file/filename-naming-convention': 'off',
    },
  },
  {
    files: ['**/404/**'],
    rules: {
      'check-file/folder-naming-convention': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    rules: {
      'react/jsx-props-no-spreading': 'off',
    },
  },
  eslintConfigPrettier,
);
