const router = __non_webpack_require__('/lib/router')();
const { getSiteConfig, getContent, pageUrl } = __non_webpack_require__('/lib/xp/portal');
const { get  } = __non_webpack_require__('/lib/xp/content');
const { data } = __non_webpack_require__( '/lib/util')
const { request } = __non_webpack_require__( '/lib/http-client')

exports.filter = function(req, next) {
  if(req.params.selfRequest) return next(req)

  const content = getContent();
  const pathElements = req.path.split(content._path)
  const currentPath = `${content._path}${pathElements[1]}`
  const routerConfigs = data.forceArray(getSiteConfig().router)

  // Check if current path is in any siteconfigs router configuration
  const routerConfig = routerConfigs
    .filter( (router) => isPathInRouterConfigSetup(currentPath, router.source))
    .filter( () => !get({key: currentPath}))

  // check if any content exists
  if(routerConfig.length > 0 && req.mode === 'preview') {
    delete req.headers['Accept-Encoding']
    const targetContent = get({key: routerConfig[0].target})
    const targetUrl = targetContent ? `${pathElements[0]}${targetContent._path}` : '/'
    const targetResponse = request({
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

    return {
      body: targetResponse.body
    }

  }

  return next(req)

}

function isPathInRouterConfigSetup(currentPath, sourceContentId) {
  const contentFrom = get({key: sourceContentId })
  const currentPathArray = currentPath.split('/').slice(0, -1).join('/');
  return currentPathArray === contentFrom._path;
}
