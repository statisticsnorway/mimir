const {
  getSiteConfig, getContent, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  request
} = __non_webpack_require__( '/lib/http-client')
const {
  newCache
} = __non_webpack_require__( '/lib/cache')


const filterCache = newCache({
  size: 1000,
  expire: 300
})

exports.filter = function(req, next) {
  if (req.params.selfRequest) return next(req)

  const content = getContent()
  const pathElements = req.rawPath.split(content._path)
  const currentPath = `${content._path}${pathElements[pathElements.length - 1]}`
  const routerConfigs = data.forceArray(getSiteConfig().router)

  // Check if current path is in any siteconfigs router configuration
  const routerConfig = routerConfigs
    .filter( (router) => router !== undefined && isPathInRouterConfigSetup(currentPath, router.source))
    .filter( () => !get({
      key: currentPath
    }))

  if (routerConfig.length > 0) {
    delete req.headers['Accept-Encoding']
    const targetUrl = routerConfig[0].target ? pageUrl({
      id: routerConfig[0].target
    }) : '/'


    const targetResponse = filterCache.get(`filter_${req.path}`, () => {
      return request({
        url: `http://localhost:8080${targetUrl}`,
        headers: req.headers,
        cookies: req.cookies,
        params: {
          selfRequest: true,
          pathname: req.path.split('/').pop(),
          pageTitle: routerConfig[0].pageTitle ? routerConfig[0].pageTitle : ''
        },
        connectionTimeout: 5000,
        readTimeout: 20000
      })
    })

    return {
      body: targetResponse.body
    }
  }
  if (content._path.endsWith(currentPath)) {
    return next(req)
  }
  return {
    status: 404
  }
}

function isPathInRouterConfigSetup(currentPath, sourceContentId) {
  const contentFrom = get({
    key: sourceContentId
  })
  const currentPathArray = currentPath.split('/').slice(0, -1).join('/')
  return currentPathArray === contentFrom._path
}
