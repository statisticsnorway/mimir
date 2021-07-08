const path = require('path')
const glob = require('glob')
const R = require('ramda')
const {
  setEntriesForPath,
  addRule,
  prependExtensions
} = require('./util/compose')
const env = require('./util/env')

const RESOURCES_PATH = 'src/main/resources'

// ----------------------------------------------------------------------------
// Base config
// ----------------------------------------------------------------------------

const config = {
  context: path.join(__dirname, RESOURCES_PATH),
  entry: {},
  externals: [
    /(\/lib\/(enonic|xp|mustache|thymeleaf))?\/.+/
  ],
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
  plugins: [],
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
  const CONTENT_TYPE_CONFIGS = glob.sync(`${RESOURCES_PATH}/site/content-types/**/*.ts`)
  const TYPES = glob.sync(`${RESOURCES_PATH}/lib/types/*.ts`)
  const PART_CONFIGS = glob.sync(`${RESOURCES_PATH}/site/parts/**/*-part-config.ts`)
  const LAYOUT_CONFIGS = glob.sync(`${RESOURCES_PATH}/site/layouts/**/*-config.ts`)
  const PAGE_CONFIGS = glob.sync(`${RESOURCES_PATH}/site/pages/**/*-page-config.ts`)
  const MACRO_CONFIGS = glob.sync(`${RESOURCES_PATH}/site/macros/**/*-config.ts`)
  const IGNORED_FILES = R.pipe(
    R.map((entry) => path.join(RESOURCES_PATH, entry)),
    R.concat(CLIENT_FILES),
    R.concat(CONTENT_TYPE_CONFIGS),
    R.concat(TYPES),
    R.concat(PART_CONFIGS),
    R.concat(LAYOUT_CONFIGS),
    R.concat(PAGE_CONFIGS),
    R.concat(MACRO_CONFIGS),
  )(ignoreList)
  const SERVER_FILES = glob.sync(`${RESOURCES_PATH}/**/*.${extensions}`, {
    absolute: false,
    ignore: IGNORED_FILES
  })
  return SERVER_FILES.map((entry) => path.relative(RESOURCES_PATH, entry))
}

// TYPESCRIPT
function addTypeScriptSupport(cfg) {
  const rule = {
    test: /\.ts$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
    options: {
      configFile: 'src/main/resources/tsconfig.server.json'
    }
  }

  const entries = listEntries('ts', [
    // Add additional files to the ignore list.
    // The following path will be transformed to 'src/main/resources/types.ts:
    'types.ts',
    '*.jsx'
  ]).filter((entry) => entry.indexOf('.d.ts') === -1)
  return R.pipe(
    setEntriesForPath(entries),
    addRule(rule),
    prependExtensions(['.ts', '.json'])
  )(cfg)
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
  addBabelSupport,
  addTypeScriptSupport
)(config)
