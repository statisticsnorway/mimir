module.exports = function(env, config) {
  // This makes 'npm link' symlinks in node_modules work:
  config.resolve.symlinks = false

  console.log(config)

  return config
}
