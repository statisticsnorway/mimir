const {
  setupEventLog
} = __non_webpack_require__( '/lib/ssb/repo/eventLog')
const {
  setupStatRegRepo
} = __non_webpack_require__( '/lib/ssb/repo/statreg')
const {
  setupDatasetRepo
} = __non_webpack_require__( '/lib/ssb/repo/dataset')
const cache = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  setupFetchDataOnCreateListener
} = __non_webpack_require__('/lib/ssb/dataset/listeners')
const {
  setupCronJobs
} = __non_webpack_require__('/lib/ssb/cron/cron')

log.info('Application ' + app.name + ' started') // Log application started
__.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

cache.setup()
setupEventLog()
setupDatasetRepo()
setupStatRegRepo()
setupFetchDataOnCreateListener()
setupCronJobs()

const now = new Date()
log.info(`Startup script complete: ${now.toISOString()}`)
