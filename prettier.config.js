export default {
  importOrderParserPlugins: ['importAssertions', 'typescript', 'jsx'],
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-packagejson',
    'prettier-plugin-tailwindcss',
  ],
  singleQuote: true,
  semi: false,
  tailwindAttributes: ['className'],
  tailwindFunctions: ['cx'],
  bracketSpacing: true,
  arrowParens: 'always',
  bracketSameLine: true,
}
