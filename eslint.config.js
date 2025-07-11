import nkzw from '@nkzw/eslint-config'

export default [
  ...nkzw,
  {
    ignores: [
      '__generated__',
      '.expo',
      'android/',
      'dist/',
      'ios/',
      'vite.config.ts.timestamp-*',
    ],
  },
  {
    files: ['scripts/**/*.tsx'],
    rules: {
      'no-console': 0,
      'sort-keys': 0,
    },
  },
  {
    files: ['metro.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 0,
      'sort-keys': 0,
    },
  },
  {
    rules: {
      '@typescript-eslint/array-type': [2, { default: 'generic' }],
      '@typescript-eslint/no-restricted-imports': [
        2,
        {
          paths: [
            {
              importNames: ['Text'],
              message:
                'Please use the corresponding UI components from `src/ui/` instead.',
              name: 'react-native',
            },
            {
              importNames: ['ScrollView'],
              message:
                'Please use the corresponding UI component from `react-native-gesture-handler` instead.',
              name: 'react-native',
            },
            {
              importNames: ['BottomSheetModal'],
              message:
                'Please use the corresponding UI components from `src/ui/` instead.',
              name: '@gorhom/bottom-sheet',
            },
          ],
        },
      ],
      'import-x/no-extraneous-dependencies': [
        2,
        {
          devDependencies: [
            './eslint.config.js',
            './scripts/**.tsx',
            './tailwind.config.ts',
            './vitest.config.js',
            '**/*.test.tsx',
          ],
        },
      ],
      'sort-keys': 0,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    rules: {
      'sort-keys': 0,
      'sort-keys-fix/sort-keys-fix': 0,
      'no-console': 0,
      '@typescript-eslint/array-type': 0,
      '@typescript-eslint/no-restricted-imports': 0,
      'sort-destructure-keys/sort-destructure-keys': 0,
      'react/jsx-sort-props': 0,
      'typescript-sort-keys/interface': 0,
    },
  },
]
