const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { createJiti } = require('jiti')
const { fileURLToPath } = require('node:url')
const path = require('node:path')

const jiti = createJiti(
  fileURLToPath(require('node:url').pathToFileURL(__filename).toString()),
)
jiti.import('./src/env')

const config = getDefaultConfig(__dirname)

const ALIASES = {
  tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
}

module.exports = withNativeWind(
  {
    ...config,
    resolver: {
      ...config.resolver,
      assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...config.resolver.sourceExts, 'svg', 'json', 'mjs'],
      unstable_enablePackageExports: true,
      unstable_conditionNames: ['require', 'react-native', 'default'],
      resolveRequest: (context, moduleName, platform) => {
        return context.resolveRequest(
          context,
          ALIASES[moduleName] ?? moduleName,
          platform,
        )
      },
    },
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve(
        'react-native-svg-transformer/expo',
      ),
    },
  },
  {
    input: './src/global.css',
  },
)
