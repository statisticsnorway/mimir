var path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (env, config) {
  // This makes 'npm link' symlinks in node_modules work:
  if (!config.resolve.alias) {
    config.resolve.alias = {}
  }
  config.resolve.alias['/react4xp'] = path.resolve(__dirname, './src/main/resources/react4xp/')
  config.resolve.symlinks = false

  // config.plugins = [
  //   new BundleAnalyzerPlugin(),
  //]

  return config
}
