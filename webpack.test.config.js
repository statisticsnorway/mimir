const path = require('path')
const glob = require('glob')
const R = require('ramda')
const {
  setEntriesForPath,
  addRule,
  addPlugin,
  prependExtensions
} = require('./util/compose')
const env = require('./util/env')

const RESOURCES_PATH = 'src/test/resources'

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, RESOURCES_PATH),
  entry: {},
  output: {
    path: path.join(__dirname, '/build/resources/main'),
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: []
  },
  optimization: {
    minimize: false
  },
  plugins: [
  ],
  externals: [
    /\/lib\/(enonic|xp)\/.+/
  ],
  mode: env.type,
  // Source maps are not usable in server scripts
  devtool: false
}

// ----------------------------------------------------------------------------
// JavaScript loaders
// ----------------------------------------------------------------------------

function listEntries(extensions, ignoreList) {
  const CLIENT_FILES = glob.sync(`${RESOURCES_PATH}/assets/**/*.${extensions}`)
  const IGNORED_FILES = R.pipe(
    R.map((entry) => path.join(RESOURCES_PATH, entry)),
    R.concat(CLIENT_FILES)
  )(ignoreList)
  console.log(IGNORED_FILES)
  const SERVER_FILES = glob.sync(`${RESOURCES_PATH}/**/*.${extensions}`, {
    absolute: false,
    ignore: IGNORED_FILES
  })
  return SERVER_FILES.map((entry) => path.relative(RESOURCES_PATH, entry))
}

// BABEL
function addBabelSupport(cfg) {
  const rule = {
    test: /\.(es6?|js|mjs)$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [],
      presets: [
        [
          '@babel/preset-env',
          {
            // Use custom Browserslist config
            targets: 'node 0.10',
            // Polyfills are not required in runtime
            useBuiltIns: false
          }
        ]
      ]
    }
  }

  const entries = listEntries('{js,es,es6}', [
    // Add additional files to the ignore list.
    // The following path will be transformed to 'src/main/resources/lib/observe/observe.es6':
    'lib/observe/observe.es6'
  ])

  console.log(entries)

  return R.pipe(
    setEntriesForPath(entries),
    addRule(rule),
    prependExtensions(['.js', '.es', '.es6', '.json', 'mjs'])
  )(cfg)
}

// ----------------------------------------------------------------------------
// Result config
// ----------------------------------------------------------------------------

module.exports = R.pipe(
  addBabelSupport
)(config)
