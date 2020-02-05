const router = __non_webpack_require__('/lib/router')()
log.info("in webapp")

log.info('%s', JSON.stringify(router, null, 3))

exports.all = function(req){
  log.info('== In all ==')
  return router.dispatch(req);
}

router.get('/test', function(req) {
  log.info('testing router')
  return {
    body: "Test test",
    contentType: "text/plain"
  }
})

