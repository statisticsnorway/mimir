// TODO: New general comment explanation!

const React4xpEntriesAndChunks = require('react4xp-build-entriesandchunks');
const StatsPlugin = require('stats-webpack-plugin');
const path = require('path');
const fs = require('fs');

// Turns a comma-separated list of subdirectories below the root React4xp source folder (SRC_R4X) into an array of unique,
// verified, absolute-path'd and OS-compliant folder names. Halts on errors, displays warnings, skips items that are not found.
const normalizeDirList = (
  commaSepDirList,
  singularLabel,
  SRC_R4X,
  symlinksUnderReact4xpRoot,
  VERBOSE
) =>
  (commaSepDirList || '').trim() ?
    Array.from(
      new Set(
        commaSepDirList
          .trim()
          .replace(/[\\/]/g, path.sep)
          .replace(/[´`'"]/g, '')
          .split(',')

          .map((item) => (item || '').trim())
          .filter((item) => !!item)
          .map((item) => item.replace(/[\\/]$/, ''))
          .map((orig) => {
            let dir = path.resolve(path.join(SRC_R4X, orig));

            let realDir = null;
            try {
              realDir = fs.realpathSync(dir);
            } catch (e) {
              if (VERBOSE) {
                console.warn(
                  `Warning - error message dump for ${singularLabel} '${orig}':\n--------`
                );
                console.warn(e);
              }
              console.warn(
                `${
                  VERBOSE ? '-------->' : 'Warning:'
                } skipping ${singularLabel} '${orig}' from react4xp.properties${
                  !VERBOSE ?
                    ' - it probably just doesn\'t exist. If you\'re sure it exists, there may be another problem - run the build again with verbose option in react4xp.properties for full error dump' :
                    ''
                }.`
              );
              return null;
            }

            let symlinkTargetDir = null;
            let lstat = fs.lstatSync(dir);
            while (lstat.isSymbolicLink()) {
              symlinkTargetDir = fs.readlinkSync(dir);
              dir = path.resolve(dir, '..', symlinkTargetDir);

              if (fs.existsSync(dir)) {
                if (dir.startsWith(SRC_R4X)) {
                  // eslint-disable-next-line no-param-reassign
                  symlinksUnderReact4xpRoot[orig] = true;
                }
                lstat = fs.lstatSync(dir);
              } else {
                throw Error(
                  `${singularLabel.replace(/^\w/, (c) =>
                    c.toUpperCase()
                  )} '${orig}' from react4xp.properties leads by resolved symlink(s) to '${dir}', which was not found.`
                );
              }
            }

            lstat = fs.lstatSync(realDir);
            if (!lstat.isDirectory()) {
              throw Error(
                `Can't add ${singularLabel} '${orig}' from react4xp.properties - ${realDir} was found but is not a directory.`
              );
            }

            return realDir;
          })
          .filter((dir) => !!dir)
      )
    ) :
    [];

const makeExclusionsRegexpString = (currentDir, otherDirs, VERBOSE) =>
  otherDirs
    .filter((dir) => dir !== currentDir && dir.startsWith(currentDir))
    .map((dir) => dir.slice(currentDir.length))
    .map((d) => {
      let dir = d;
      if (dir.startsWith(path.sep)) {
        dir = dir.slice(1);
      }
      if (dir.endsWith(path.sep)) {
        dir = dir.slice(0, dir.length - 1);
      }
      if (VERBOSE) {
        console.log(`\tExcluding '${dir}' relative to '${currentDir}'`);
      }
      return dir;
    })
    // TODO: escape characters in folder names that actually are regexp characters
    .join('|')
    .trim();

// -------------------------------------------------------------

module.exports = (env = {}) => {
  const {
    SRC_R4X,
    BUILD_R4X,
    BUILD_ENV,
    SRC_SITE,
    LIBRARY_NAME,
    EXTERNALS,
    COMPONENT_STATS_FILENAME,
    CHUNK_CONTENTHASH,
    ENTRIES_FILENAME
    // eslint-disable-next-line import/no-dynamic-require, global-require
  } = require(path.join(process.cwd(), env.REACT4XP_CONFIG_FILE));

  const DEVMODE = BUILD_ENV !== 'production';
  const VERBOSE = `${env.VERBOSE || ''}`.trim().toLowerCase() === 'true';

  // TODO: Probably more consistent if this too is a master config file property. Add to react4xp-buildconstants and import above from env.REACT4XP_CONFIG_FILE.
  let OVERRIDE_COMPONENT_WEBPACK = `${env.OVERRIDE_COMPONENT_WEBPACK ||
    ''}`.trim();
  let overrideCallback = (_, config) => config;
  if (OVERRIDE_COMPONENT_WEBPACK) {
    OVERRIDE_COMPONENT_WEBPACK = path.join(
      process.cwd(),
      OVERRIDE_COMPONENT_WEBPACK
    );

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const overridden = require(OVERRIDE_COMPONENT_WEBPACK);

    if (typeof overridden === 'object') {
      overrideCallback = () => overridden;
    } else if (typeof overridden === 'function') {
      overrideCallback = overridden;
    } else {
      throw Error(
        `Optional overrideComponentWebpack (${OVERRIDE_COMPONENT_WEBPACK}) doesn't seem to default-export an object or a (env, config) => config function. Should either export a webpack-config-style object directly, OR take an env object and a webpack-config-type object 'config' as arguments, then manipulate or replace config, then return it.`
      );
    }
  }

  // -------------------------------------  Okay, settings and context are parsed. Let's go:

  let symlinksUnderReact4xpRoot = {};

  const chunkDirs = normalizeDirList(
    env.CHUNK_DIRS,
    'chunkDir',
    SRC_R4X,
    symlinksUnderReact4xpRoot,
    VERBOSE
  );

  const entryDirs = normalizeDirList(
    env.ENTRY_DIRS,
    'entryDir',
    SRC_R4X,
    symlinksUnderReact4xpRoot,
    VERBOSE
  );

  // -----------------------------------------------------------  Catching some likely troublemakers:

  symlinksUnderReact4xpRoot = Object.keys(symlinksUnderReact4xpRoot).filter(
    (key) => !!symlinksUnderReact4xpRoot[key]
  );
  if (symlinksUnderReact4xpRoot.length) {
    console.warn(
      `Warning: ${
        symlinksUnderReact4xpRoot.length
      } chunkDir(s) / entryDir(s) in react4xp.properties are symlinks that lead inside the folder structure below the React4xp root (${SRC_R4X}). This could cause a mess in React4xp's entry/chunk structure, so I hope you know what you're doing. These are: '${symlinksUnderReact4xpRoot.join(
        '\', \''
      )}'`
    );
  }
  const duplicates = chunkDirs.filter((dir) => entryDirs.indexOf(dir) !== -1);
  if (duplicates.length) {
    throw Error(
      `${
        duplicates.length
      } directories in react4xp.properties are listed both as chunkDirs and entryDirs. Bad items are: '${duplicates.join(
        '\', \''
      )}'`
    );
  }

  const siteParsed = path.parse(SRC_SITE);
  const tooGeneralPaths = SRC_SITE.split(path.sep).reduce((accum, current) => {
    const longestPath = accum.slice(-1)[0];
    if (longestPath === undefined) {
      return [siteParsed.root];
    }
    const dir = path.resolve(longestPath, current);
    if (dir !== SRC_SITE) {
      accum.push(dir);
    }
    return accum;
  }, []);

  const badChunkDirs = chunkDirs.filter(
    (dir) =>
      dir === SRC_SITE ||
      dir.startsWith(SRC_SITE) ||
      tooGeneralPaths.indexOf(dir) !== -1
  );
  if (badChunkDirs.length) {
    throw Error(
      `${
        badChunkDirs.length
      } chunkDir(s) in react4xp.properties are illegal or too general. For chunkDirs, avoid 'src/main/resources/site' in general, and direct references to its parent directories. Bad items are: '${badChunkDirs.join(
        '\', \''
      )}'`
    );
  }
  const badEntryDirs = entryDirs.filter(
    (dir) => tooGeneralPaths.indexOf(dir) !== -1
  );
  if (badEntryDirs.length) {
    throw Error(
      `${
        badEntryDirs.length
      } entryDir(s) in react4xp.properties are too general. For entryDirs, avoid direct references to the XP folder 'src/main/resources/' or its direct parent directories. Bad items are: '${badEntryDirs.join(
        '\', \''
      )}'`
    );
  }

  // ------------------- Build the entry list:

  // Normalize and clean the entry extensions list:
  const entryExtensions = (env.ENTRY_EXT || 'jsx,tsx,js,ts,es6,es')
    .trim()
    .replace(/[´`'"]/g, '')
    .split(',')
    .map((ext) => ext.trim())
    .map((ext) => ext.replace(/^\./, ''))
    .filter((ext) => !!ext);

  // Build the entries
  const entrySets = [
    {
      sourcePath: SRC_SITE,
      sourceExtensions: ['jsx', 'tsx'],
      targetSubDir: 'site'
    },
    {
      sourcePath: path.join(
        process.cwd(),
        'node_modules',
        'react4xp-regions',
        'entries'
      ),
      sourceExtensions: ['jsx', 'tsx', 'js', 'ts', 'es6', 'es']
    },
    ...entryDirs.map((entryDir) => ({
      sourcePath: entryDir,
      sourceExtensions: entryExtensions
    }))
  ];

  const entries = React4xpEntriesAndChunks.getEntries(
    entrySets,
    BUILD_R4X,
    ENTRIES_FILENAME,
    VERBOSE
  );

  // ------------------------------------------- Entries are generated. Error reporting and verbose output:

  if (entries && typeof entries !== 'object') {
    console.error(
      `react4xp-build-entriesandchunks used entrySets (${
        Array.isArray(entrySets) ?
          `array[${entrySets.length}]` :
          typeof entrySets +
            (entrySets && typeof entrySets === 'object' ?
              ` with keys: ${JSON.stringify(Object.keys(entrySets))}` :
              '')
      }): ${JSON.stringify(entrySets, null, 2)}`
    );
    throw Error(
      `react4xp-build-components can't continue. The sub-package react4xp-build-entriesandchunks seems to have produced malformed 'entries' data, using the entrysets above. Run the build with verbose=true in react4xp.properties for more info. Expected an object, but got ${
        Array.isArray(entries) ?
          `array[${entries.length}]` :
          typeof entries +
            (entries && typeof entries === 'object' ?
              ` with keys: ${JSON.stringify(Object.keys(entries))}` :
              '')
      }: ${JSON.stringify(entries)}`
    );
  }

  if (!entries || !Object.keys(entries).length) {
    console.error(
      `react4xp-build-entriesandchunks used entrySets (${
        Array.isArray(entrySets) ?
          `array[${entrySets.length}]` :
          typeof entrySets +
            (entrySets && typeof entrySets === 'object' ?
              ` with keys: ${JSON.stringify(Object.keys(entrySets))}` :
              '')
      }): ${JSON.stringify(entrySets, null, 2)}`
    );
    throw Error(
      `react4xp-build-components can't continue - no entries were found (entries=${JSON.stringify(
        entries
      )}). Tip: the combination of entryDirs and entryExtensions in react4xp.properties was resolved to the entrySets above. Check the content of those directories, with those file extensions. Add entry source files, adjust react4xp.properties, or run the build with verbose=true in react4xp.properties for more info.`
    );
  }

  if (VERBOSE) {
    console.log(
      `\nreact4xp-build-components: entries (${
        Array.isArray(entries) ?
          `array[${entries.length}]` :
          typeof entries +
            (entries && typeof entries === 'object' ?
              ` with keys: ${JSON.stringify(Object.keys(entries))}` :
              '')
      }) = ${JSON.stringify(entries, null, 2)}`
    );
  }

  // ------------------------------  Generated the webpack cacheGroups

  const detectedTargetDirs = [...entryDirs, ...chunkDirs];
  const react4xpExclusions = makeExclusionsRegexpString(
    SRC_R4X,
    detectedTargetDirs,
    VERBOSE
  );
  const cacheGroups = {
    vendors: {
      name: 'vendors',
      enforce: true,
      test: '[\\/]node_modules[\\/]((?!(react4xp-regions)).)[\\/]?',
      chunks: 'all',
      priority: 100
    },
    templates: {
      name: 'templates',
      enforce: true,
      test: '[\\/]node_modules[\\/]react4xp-regions[\\/]?',
      chunks: 'all',
      priority: 99
    },
    react4xp: {
      name: 'react4xp',
      enforce: true,
      chunks: 'all',
      priority: 1,
      test: `${SRC_R4X}${
        react4xpExclusions ? `[\\/]((?!(${react4xpExclusions})).)[\\/]?` : ''
      }`
    }
  };

  // Add new cacheGroups, excluding (by regexp) both other chunknames and entrydirs
  const takenNames = ['vendors', 'templates', 'react4xp'];
  chunkDirs.forEach((chunkDir) => {
    let name = chunkDir.split(path.sep).slice(-1)[0];
    if (takenNames.indexOf(name) !== -1) {
      name = `react4xp_${chunkDir
        .slice(SRC_R4X.length)
        .replace(new RegExp(path.sep, 'g'), '__')}`;

      while (takenNames.indexOf(name) !== -1) {
        name += '_';
      }
    }
    takenNames.push(name);

    const chunkExclusions = makeExclusionsRegexpString(
      chunkDir,
      detectedTargetDirs,
      VERBOSE
    );
    const test = `${chunkDir}${
      chunkExclusions ? `[\\/]((?!(${chunkExclusions})).)[\\/]?` : ''
    }`;

    cacheGroups[name] = {
      name,
      test,
      enforce: true,
      chunks: 'all',
      priority: 1
    };
  });

  // Display the generated cachegroups:
  if (VERBOSE) {
    console.log(
      `react4xp-buikd-components generated cacheGroups (.test attributes that are strings will be turned into RegExp): ${JSON.stringify(
        cacheGroups,
        null,
        2
      )}`
    );
  }

  // Finally, turn all generated regexp strings in each .test attribute into actual RegExp's:
  Object.keys(cacheGroups).forEach((key) => {
    cacheGroups[key] = {
      ...cacheGroups[key],
      test:
        typeof cacheGroups[key].test === 'string' ?
          new RegExp(cacheGroups[key].test) :
          cacheGroups[key].test
    };
  });

  // ------------------------------------------

  // Decides whether or not to hash filenames of common-component chunk files, and the length of the hash
  let chunkFileName;
  if (!CHUNK_CONTENTHASH) {
    chunkFileName = '[name].js';
  } else if (typeof CHUNK_CONTENTHASH === 'string') {
    chunkFileName = CHUNK_CONTENTHASH;
  } else {
    chunkFileName = `[name].[contenthash:${parseInt(
      CHUNK_CONTENTHASH,
      10
    )}].js`;
  }

  const config = {
    mode: BUILD_ENV,

    entry: entries,

    output: {
      path: BUILD_R4X, // <-- Sets the base url for plugins and other target dirs. Note the use of {{assetUrl}} in index.html (or index.ejs).
      filename: '[name].js', // <-- Does not hash entry component filenames
      chunkFilename: chunkFileName,
      libraryTarget: 'var',
      library: [LIBRARY_NAME, '[name]']
    },

    resolve: {
      extensions: ['.es6', '.js', '.jsx']
    },

    devtool: DEVMODE ? 'source-map' : false,

    module: {
      rules: [
        {
          // Babel for building static assets. Excluding node_modules BUT ALLOWING node_modules/react4xp-regions
          test: /\.((jsx?)|(es6))$/,
          exclude: /(?=.*[\\/]node_modules[\\/](?!react4xp-regions))^(\w+)$/,
          loader: 'babel-loader',
          query: {
            compact: !DEVMODE,
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: [
              '@babel/plugin-transform-arrow-functions',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      ]
    },

    externals: EXTERNALS,

    optimization: {
      splitChunks: {
        name: false,
        cacheGroups
      }
    },

    plugins: [
      new StatsPlugin(COMPONENT_STATS_FILENAME, {
        // Display the entry points with the corresponding bundles
        entrypoints: true, // <-- THE IMPORTANT ONE, FOR DEPENDENCY TRACKING!
        errors: true,
        warnings: true,

        // Everything else switched off:
        assets: false,
        builtAt: false,
        cached: false,
        cachedAssets: false,
        children: false,
        chunks: false,
        chunkGroups: false,
        chunkModules: false,
        chunkOrigins: false,
        depth: false,
        env: false,
        errorDetails: false,
        hash: false,
        modules: false,
        moduleTrace: false,
        performance: false,
        providedExports: false,
        publicPath: false,
        reasons: false,
        source: false,
        timings: false,
        usedExports: false,
        version: false
      })
    ]
  };

  const outputConfig = overrideCallback(env, config);

  if (VERBOSE) {
    console.log(
      `\n-------------------- react4xp-build-components: webpack config output${
        OVERRIDE_COMPONENT_WEBPACK ?
          ` (ADJUSTED BY ${OVERRIDE_COMPONENT_WEBPACK}): ` :
          ': '
      }${JSON.stringify(outputConfig, null, 2)}\n-------------------------`
    );
  }

  return outputConfig;
};
