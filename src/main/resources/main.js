const {
  refreshDataset
} = __non_webpack_require__('/lib/dataquery')
const content = __non_webpack_require__( '/lib/xp/content')
const cron = __non_webpack_require__('/lib/cron')
const { request } = __non_webpack_require__('/lib/http-client')

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
  cron: '0 9 * * *',
  times: 365 * 10,
  callback: job,
  context: master
})

log.info('Pinging instance to fire up react initiation')
const result = request({
  url: 'http://localhost:8080/site/default/master/mimir',
  method: 'get'
})




