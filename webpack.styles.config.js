const path = require('path')
const R = require('ramda')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {
  setEntry,
  addRule,
  addPlugin,
  appendExtensions
} = require('./util/compose')
const env = require('./util/env')

const isProd = env.prod
const isDev = env.dev

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, '/src/main/resources/assets/styles'),
  entry: {},
  output: {
    path: path.join(__dirname, '/build/resources/main/assets/styles'),
    filename: '[name].css'
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
// CSS loaders
// ----------------------------------------------------------------------------

const createDefaultCssLoaders = () => ([
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: '../'
    }
  },
  {
    loader: 'css-loader',
    options: {
      sourceMap: !isProd,
      importLoaders: 1
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: !isProd
    }
  }
])

const createCssPlugin = () => (
  new MiniCssExtractPlugin({
    filename: './[name].css',
    chunkFilename: '[name].css'
  })
)

// SASS & SCSS
function addSassSupport(cfg) {
  const rule = {
    test: /\.(sass|scss)$/,
    use: [
      ...createDefaultCssLoaders(),
      {
        loader: 'sass-loader',
        options: {
          sourceMap: !isProd
        }
      }
    ]
  }

  const plugin = createCssPlugin()

  return R.pipe(
    setEntry('bundle', './main.scss'),
    setEntry('bundleMenu', './menu.scss'),
    addRule(rule),
    addPlugin(plugin),
    appendExtensions(['.sass', '.scss', '.css'])
  )(cfg)
}

// ----------------------------------------------------------------------------
// Resource loaders
// ----------------------------------------------------------------------------

// FONTS IN CSS
function addFontSupport(cfg) {
  const rule = {
    test: /\.(eot|woff|woff2|ttf|svg)$/,
    use: 'file-loader?name=fonts/[name].[ext]'
  }

  return R.pipe(
    addRule(rule)
  )(cfg)
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  addSassSupport,
  addFontSupport
)(config)
