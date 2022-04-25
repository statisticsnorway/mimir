// ──────────────────────────────────────────────────────────────────────────────
// A template version of this, with upated properties and explanations,
//  can always be found in the react4xp NPM package:
//   node_modules/react4xp/examples/react4xp.config.js (after installing)
//  or:
//   https://github.com/enonic/enonic-react4xp/blob/master/examples/react4xp.config.js
// ──────────────────────────────────────────────────────────────────────────────

module.exports = {

  // ────────────────────────────────────────────────────────────────────────────
  // ENTRIES AND CHUNKING:
  // ────────────────────────────────────────────────────────────────────────────

  // If nothing is added below, this is the default behaviour:
  // - Default entry source folder is /site/, that is: src/main/resources/site/
  //   and its subfolders.
  // - Everything under react4xp root folder (src/main/resources/react4xp/) will
  //   be considered chunks and will be bundled by webpack into a single
  //   dependency imported by webpack: react4xp.<contenthash>.js
  // - Everything under the react4xp root folder (src/main/resources/react4xp/)
  //   will be considered non-entries: added files here can be imported by
  //   react4xp entries, but otherwise unreachable from react4xp.
  // - Default entryExtensions (file extensions to look for when finding entries
  //   under OTHER entryDirs than /site/) are: jsx, js, tsx, ts, es6, es


  // chunkDirs are folder names where importable, non-entry code is kept.
  //  Comma-separated list of folder names, relative to
  //  src/main/resources/react4xp/. Each folder added here will be bundled by
  //  webpack into a separate dependency chunk with the same name as the folder,
  //  and a hash: <foldername>.<contenthash>.js. This is good for grouping sets
  //  of dependencies that belong together, or will frequently be requested from
  //  the client together in some parts of a web page but not others, etc. The
  //  react4xp root (src/main/resources/react4xp/) is the standard chunk
  //  'react4xp', but you can add subfolders here to bundle them (and their
  //  subfolders) in separate chunks. Or you can add relative paths to the
  //  react4xp root to imported dependency code from elsewhere. Don't overlap
  //  with entryDirs or /site/.
  //
  // chunkDirs: [''],

  chunkDirs: ['dashboard'],

  // entryDirs are additional folder names where webpack will look for entry
  // files. Comma-separated list of folder names, relative to
  // src/main/resources/react4xp/. By default, react4xp instructs webpack to
  // look for entries under src/main/resources/site/ (and in the
  // react4xp-templates package). Added folders here will be kept out of bundled
  // dependency chunks (take care to avoid directory overlaps with chunkDirs)
  // and treated separately. Files in them will be compiled into react4xp
  // entries, which most importantly get a jsxPath (relative to their entryDir,
  // not relative to /react4xp/) and therefore are available to react4xp.
  // overrideComponentWebpack file (see above).
  //
  // For compatibility with earlier versions of react4xp, add _entries here.
  //
  // entryDirs: [''],

  entryDirs: ['_entries']

  // entryExtensions are filename extensions of files (comma-separated list)
  // below the entryDirs folders that webpack should look for and turn into
  // entries. NOTE that this doesn't apply to the default entry-folder
  // src/main/resources/site/ (or the react4xp-templates package), where ONLY
  // .jsx (and .tsx) files can be entries. This is to avoid mixups with XP
  // controllers etc, which can be .js or .es6. Default value if not changed is
  // jsx,js,tsx,ts,es6,es. Also note that tsx/ts files are NOT supported out of
  // the box. Rules for typescript compilation must be added in your own
  //
  // entryExtensions: ['jsx', 'js', 'tsx', 'ts', 'es6', 'es'],


  // ────────────────────────────────────────────────────────────────────────────
  // Externals
  // ────────────────────────────────────────────────────────────────────────────

  /* externals: {
    lodash: '_'
  }*/
} // module.exports
