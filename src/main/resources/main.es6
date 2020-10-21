const {
  setupEventLog,
  deleteExpiredEventLogs
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
  getContentWithDataSource
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  refreshQueriesAsync
} = __non_webpack_require__('/lib/task')
const cron = __non_webpack_require__('/lib/cron')
const cache = __non_webpack_require__('/lib/ssb/cache')
const {
  setupFetchDataOnCreateListener
} = __non_webpack_require__('/lib/listeners')
const {
  dataSourceRSSFilter
} = __non_webpack_require__('/lib/ssb/dataset/rss')

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

  let dataSourceQueries = getContentWithDataSource()
  dataSourceQueries = dataSourceRSSFilter(dataSourceQueries)
  updateJobLog(jobLogNode._id, (node) => {
    return {
      data: {
        ...node.data,
        queryIds: dataSourceQueries.map((q) => q._id)
      }
    }
  })
  const refreshDataResult = dataSourceQueries && refreshQueriesAsync(dataSourceQueries)
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

const deleteExpiredEventLogCron = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '* 16 * * *'
cron.schedule({
  name: 'Delete expired event logs',
  cron: deleteExpiredEventLogCron,
  times: 1,
  callback: deleteExpiredEventLogs,
  context: master
})


const now = new Date()
log.info(`Startup script complete: ${now.toISOString()}`)
