const {
  send
} = __non_webpack_require__('/lib/xp/event')

exports.get = (req) => {
  send({
    type: 'clearCache',
    distributed: true,
    data: {
      clearFilterCache: true,
      clearMenuCache: true,
      clearDatasetCache: true,
      clearDividerCache: true
    }
  })
  return {
    body: {
      message: 'cache successfully cleared'
    },
    contentType: 'application/json',
    status: 200
  }
}
