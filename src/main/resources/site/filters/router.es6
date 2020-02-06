const router = __non_webpack_require__('/lib/router')();
const { getSiteConfig, pageUrl } = __non_webpack_require__('/lib/xp/portal');
const { get } = __non_webpack_require__('/lib/xp/content');
const { data } = __non_webpack_require__( '/lib/util')

exports.filter = function(req, next){
  log.info('%s', JSON.stringify(req, null, 2))

  const path = `/${app.name}${req.path.split(app.name)[1]}`
  const routerConfigs = data.forceArray(getSiteConfig().router)



  const routerConfig = routerConfigs.filter( (router) => {
    log.info('%s', JSON.stringify(router, null, 2))
    log.info('%s', JSON.stringify(router.from, null, 2))
    log.info('Get content with id: ' + router.from)
    const contentFrom = get({key: router.from })
    return contentFrom._path === path
  })

  if(routerConfig.length > 0) {
    //const contentTo = get({key: routerConfig.to})
    const newReq = {
      ...req,
      rawPath: "/admin/site/inline/default/draft/mimir/kommunefakta/kommune",
      path: "/admin/site/inline/default/draft/mimir/kommunefakta/kommune",
      url: pageUrl({id:'ae9f2f69-7482-4c07-8231-551db92c4575'}),
      params: {
        municipality: "oslo"
      }
    }
    log.info('%s', JSON.stringify(newReq, null, 2))
    return next(newReq)

  } else {
    return next(req)
  }
}
