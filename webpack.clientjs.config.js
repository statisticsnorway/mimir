const path = require('path')
const R = require('ramda')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { setEntry, addRule, prependExtensions } = require('./util/compose')
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
            useBuiltIns: false,
          },
        ],
      ],
    },
  }

  return R.pipe(
    setEntry('divider', './app/divider.es6'),
    setEntry('highchart', './app/highchart.es6'),
    setEntry('map', './app/map.es6'),
    setEntry('tableExport', './app/tableExport.es6'),
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
  const cfg = R.pipe(addBabelSupport)({
    context: path.join(__dirname, '/src/main/resources/assets/js'),
    target: ['web', 'es2017'],
    entry: {},
    output: {
      path: path.join(__dirname, '/build/resources/main/assets/js'),
      filename: '[name].js',
    },
    resolve: {
      extensions: [],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false,
            },
          },
        }),
      ],
      splitChunks: {
        minSize: 30000,
      },
    },
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      //   'process.env.TEST': process.env.TEST
      // })
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
        // TEST: false
      }),
      // https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/master/README.md
      new BundleAnalyzerPlugin({ analyzerMode: 'disabled' }), // default is 'server'
    ],
    mode: env.type,
    // devtool: isProd ? false : 'inline-source-map'
  })
  return cfg
}
