const router = __non_webpack_require__('/lib/router')();
const { getSiteConfig } = __non_webpack_require__('/lib/xp/portal');
const { get } = __non_webpack_require__('/lib/xp/content');
const { data } = __non_webpack_require__( '/lib/util')

exports.filter = function(req, next){
  const path = `/${app.name}${req.path.split(app.name)[1]}`
  const routerConfig = data.forceArray(getSiteConfig().router)
  routerConfig.find( (router) => {
    const contentFrom = get({key: router.from })
    return contentFrom.path === path
  })
  if(routerConfig){
    const contentTo = get({key: routerConfig.to})
    return
  }else {
    return next(req)
  }
  log.info('%s', JSON.stringify(paths, null, 2))
  log.info('%s', JSON.stringify(req, null, 2))
  const response =
  return response
}
