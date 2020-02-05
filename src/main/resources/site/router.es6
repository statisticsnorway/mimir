const router = __non_webpack_require__('/lib/router')()
log.info("in router")

exports.all = function(req){
  log.info('== router ==')
  return router.dispatch(req);
}

router.get('/test', function(req) {
  log.info('testing router')
  return {
    body: "Test test",
    contentType: "text/plain"
  }
})

