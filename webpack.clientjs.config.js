const path = require('path')
const R = require('ramda')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const {
  setEntry,
  addRule,
  prependExtensions
} = require('./util/compose')
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
    setEntry('ie', './ie.es6'),
    addRule(rule),
    prependExtensions(['es6', '.js', '.json'])
  )(cfg)
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = (env) => {
  const cfg = R.pipe(
    addBabelSupport,
  )({
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
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      //   'process.env.TEST': process.env.TEST
      // })
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development' // use 'development' unless process.env.NODE_ENV is defined
        // TEST: false
      })
    ],
    mode: env.type
    // devtool: isProd ? false : 'inline-source-map'
  })
  return cfg
}
