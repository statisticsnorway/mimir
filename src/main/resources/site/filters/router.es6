const router = __non_webpack_require__('/lib/router')();
const { getSiteConfig, pageUrl } = __non_webpack_require__('/lib/xp/portal');
const { get } = __non_webpack_require__('/lib/xp/content');
const { data } = __non_webpack_require__( '/lib/util')
const { request } = __non_webpack_require__( '/lib/http-client')

exports.filter = function(req, next){
  log.info('%s', JSON.stringify(req, null, 2))

  const path = `/${app.name}${req.path.split(app.name)[1]}`
  const routerConfigs = data.forceArray(getSiteConfig().router)

  // check if any content exists
  const routerConfig = routerConfigs.filter( (router) => {
    log.info('%s', JSON.stringify(router.from, null, 2))
    const contentFrom = get({key: router.from })
    log.info('%s', JSON.stringify(contentFrom, null, 2))
    return contentFrom._path === path
  })

  delete req.headers['Accept-Encoding']

  if(req.mode === 'preview' && req.path !== '/admin/site/preview/default/draft/mimir/kommunefakta/kommune') {
    const targetUrl = '/admin/site/preview/default/draft/mimir/kommunefakta/kommune'
    const targetResponse = request({
      url: `http://localhost:8080${targetUrl}`,
      headers: req.headers,
      cookies: req.cookies,
      params: {
        municipality: 'oslo'
      }
    })
    log.info('%s', JSON.stringify(targetResponse, null, 2))
    return {
      body: targetResponse.body
    }

  } else {
    return next(req)
  }
}
