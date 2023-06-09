const fs = require('fs')
const path = require('path')

// To get the backend and ssr to recognice there has been changes, we touch the a JS file in build.
// This will trigger the disposing and remounting of the app
// By touching the partCache file, we also make sure the cache is cleared. (Not sure if this is necessary, dispose might do this already)

class WatcherTouchPlugin {
  apply(compiler) {
    const pluginName = WatcherTouchPlugin.name

    compiler.hooks.assetEmitted.tap(pluginName, (file, { content, source, outputPath, compilation, targetPath }) => {
      fs.utimesSync(
        path.dirname(__filename) + '/build/resources/main/lib/ssb/cache/partCache.js',
        new Date(),
        new Date()
      )
    })
  }
}

module.exports = WatcherTouchPlugin
