const path = require('path')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (env, config) {
  // This makes 'npm link' symlinks in node_modules work:
  if (!config.resolve.alias) {
    config.resolve.alias = {}
  }
  config.resolve.alias['/react4xp'] = path.resolve(__dirname, './src/main/resources/react4xp/')
  config.resolve.symlinks = false

  // config.plugins = [
  //    new BundleAnalyzerPlugin(),
  // ]

  // Dont bundle all node_modules import into one file
  // config.optimization.splitChunks.chunks = 'all'
  // delete config.optimization.splitChunks.cacheGroups.vendors

  // Take these packages out of vendor.js and put them in their own file.
  // These are big packages that are not used on every page, thus we let webpack only load them when needed.
  const vendorSplits = [
    'moment',
    'highcharts',
    'react-select',
    'react-table',
    'react-bootstrap',
    'react-moment',
    'react-responsive',
    'react-number-format',
  ]

  vendorSplits.forEach((package) => {
    const test = `/node_modules/${package}`
    config.optimization.splitChunks.cacheGroups[package] = {
      name: package + '-chunk',
      enforce: true,
      test: new RegExp(test),
      chunks: 'all',
      priority: 101, // higher than vendor.js (100)
    }
  })

  config.target = ['web', 'es2017']
  /* 
    Pro tip, Add:
    env.BUILD_ENV = 'development';
    to the top of the function in node_modules/@enonic/react4xp/dist/webpack.config.externals.js
    to get non-minified react in externals, so you can debug easier in the browser and XP terminal without getting minified react error
  */

  return config
}
