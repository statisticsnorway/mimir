import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import _import from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...fixupConfigRules(
    compat.extends(
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/errors',
      'prettier'
    )
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      prettier,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        require: true,
        log: true,
        exports: true,
        resolve: true,
        app: true,
        document: true,
        window: true,
        __: true,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-unused-expressions': 'off', // TODO: Re-examine this rule
      'prettier/prettier': ['warn'],
      'no-use-before-define': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      'import/no-duplicates': [
        'error',
        {
          'prefer-inline': true,
        },
      ],

      'import/no-unresolved': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: '/lib/xp/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '/lib/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '/site/**',
              group: 'internal',
              position: 'after',
            },
          ],

          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        },
      ],

      'import/newline-after-import': [
        'error',
        {
          count: 1,
        },
      ],

      complexity: ['warn', 20],
    },
  },
  ...compat.extends('plugin:react/recommended', './common.eslintrc.json', 'prettier').map((config) => ({
    ...config,
    files: ['**/*.jsx'],
  })),
  {
    files: ['**/*.jsx'],

    plugins: {
      react,
      prettier,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      'react/display-name': 'off',
    },
  },
]
