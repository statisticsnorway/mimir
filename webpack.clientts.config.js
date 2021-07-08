const path = require('path')
const R = require('ramda')
const TerserPlugin = require('terser-webpack-plugin')
const {
  setEntry,
  addRule,
  prependExtensions
} = require('./util/compose')
const env = require('./util/env')

const isProd = env.prod

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, '/src/main/resources/assets/ts'),
  entry: {},
  output: {
    path: path.join(__dirname, '/build/resources/main/assets/ts'),
    filename: '[name].js'
  },
  resolve: {
    extensions: []
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false
          }
        }
      })
    ],
    splitChunks: {
      minSize: 30000
    }
  },
  plugins: [],
  mode: env.type,
  devtool: isProd ? false : 'inline-source-map'
}

// ----------------------------------------------------------------------------
// JavaScript loaders
// ----------------------------------------------------------------------------

// TYPESCRIPT
function addTypeScriptSupport(cfg) {
  const rule = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
    options: {
      configFile: 'src/main/resources/assets/tsconfig.client.json'
    }
  }

  return R.pipe(
    setEntry('bundle', './main.ts'),
    addRule(rule),
    prependExtensions(['.tsx', '.ts', '.json'])
  )(cfg)
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  addTypeScriptSupport,
)(config)
