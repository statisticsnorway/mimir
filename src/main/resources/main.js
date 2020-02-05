const {
  refreshDataset
} = __non_webpack_require__('/lib/dataquery')
const content = __non_webpack_require__( '/lib/xp/content')
const cron = __non_webpack_require__('/lib/cron')
const router = __non_webpack_require__('/lib/router')()

const user = {
  login: 'su',
  userStore: 'system'
}
const master = { // Master context (XP)
  repository: 'com.enonic.cms.default',
  branch: 'master',
  principals: ['role:system.admin'],
  user
}

log.info('Application ' + app.name + ' started') // Log application started
__.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

function job() {
  log.info('-- Running dataquery cron job  --')
  const result = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    query: `data.table LIKE 'http*'`
  })
  result && result.hits.map((row) => {
    refreshDataset(row)
  })
}

cron.schedule({
  name: 'dataquery',
  cron: '47 10 * * *',
  times: 365 * 10,
  callback: job,
  context: master
})
log.info('%s', JSON.stringify(exports, null, 3))

exports.all = function(req){
  log.info('== In main all blupp ==')
  return router.dispatch(req);
}

router.get('/{.+}', function(req) {
  log.info('testing router in main')
  return {
    body: "Test test",
    contentType: "text/plain"
  }
})
router.get('/test', function(req) {
  log.info('testing router in main')
  return {
    body: "Test test",
    contentType: "text/plain"
  }
})
router.get('/mimir/test', function(req) {
  log.info('testing router in main')
  return {
    body: "Test test",
    contentType: "text/plain"
  }
})



