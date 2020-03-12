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
  context: path.join(__dirname, '/src/main/resources/assets/js'),
  entry: {},
  output: {
    path: path.join(__dirname, '/build/resources/main/assets/js'),
    filename: '[name].js'
  },
  resolve: {
    extensions: []
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
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

// BABEL
function addBabelSupport(cfg) {
  const rule = {
    test: /\.js?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [],
      presets: [
        [
          '@babel/preset-env',
          {
            // false means polyfill not required runtime
            useBuiltIns: false
          }
        ]
      ]
    }
  }

  return R.pipe(
    setEntry('bundle', './main.es6'),
    addRule(rule),
    prependExtensions(['es6', '.js', '.json'])
  )(cfg)
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  addBabelSupport,
)(config)
