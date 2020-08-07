const {
  setupEventLog
} = __non_webpack_require__( '/lib/repo/eventLog')
const {
  completeJobLog,
  startJobLog,
  updateJobLog,
  JobStatus
} = __non_webpack_require__('/lib/repo/job')
const {
  setupStatRegRepo
} = __non_webpack_require__( '/lib/repo/statreg')
const {
  setupDatasetRepo
} = __non_webpack_require__( '/lib/repo/dataset')
const {
  refreshQueriesAsync
} = __non_webpack_require__('/lib/task')
const content = __non_webpack_require__( '/lib/xp/content')
const cron = __non_webpack_require__('/lib/cron')
const cache = __non_webpack_require__('/lib/ssb/cache')
const {
  setupFetchDataOnCreateListener
} = __non_webpack_require__('/lib/listeners')

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
  log.info('-- Running dataquery cron job --')
  const jobLogNode = startJobLog('-- Running dataquery cron job --')
  const allHttpQueries = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    query: `data.table LIKE 'http*'`
  })
  updateJobLog(jobLogNode._id, (node) => {
    return {
      data: {
        ...node.data,
        queryIds: allHttpQueries.hits.map(( httpQuery) => httpQuery._id)
      }
    }
  })
  const refreshDataResult = allHttpQueries && refreshQueriesAsync(allHttpQueries)
  completeJobLog(jobLogNode._id, JobStatus.COMPLETE, refreshDataResult)
  log.info('-- Completed dataquery cron job --')
}

const dataqueryCron = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'
cron.schedule({
  name: 'dataquery',
  cron: dataqueryCron,
  times: 365 * 10,
  callback: job,
  context: master
})

cache.setup()

setupEventLog()
setupDatasetRepo()
setupStatRegRepo()
setupFetchDataOnCreateListener()

// and setup a cron for periodic executions in the future
const statregCron = app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
const STATREG_CRON_CONFIG = {
  name: 'StatReg Periodic Refresh',
  cron: statregCron,
  times: 365 * 10,
  callback: setupStatRegRepo,
  context: master
}

cron.schedule(STATREG_CRON_CONFIG)
// StatReg Repo --------------------------------------------------------------


const now = new Date()
log.info(`Startup script complete: ${now.toISOString()}`)
