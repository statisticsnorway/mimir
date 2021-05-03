const {
  setupEventLog
} = __non_webpack_require__( '/lib/repo/eventLog')
const {
  setupStatRegRepo
} = __non_webpack_require__( '/lib/repo/statreg')
const {
  setupDatasetRepo
} = __non_webpack_require__( '/lib/repo/dataset')
const cache = __non_webpack_require__('/lib/ssb/cache')
const {
  setupFetchDataOnCreateListener
} = __non_webpack_require__('/lib/listeners')
const {
  setupCronJobs
} = __non_webpack_require__('/lib/ssb/cron')
const {
  create
} = __non_webpack_require__('/lib/featureToggle')

log.info('Application ' + app.name + ' started') // Log application started
__.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

cache.setup()
setupEventLog()
setupDatasetRepo()
setupStatRegRepo()
setupFetchDataOnCreateListener()
setupCronJobs()

create([
  {
    space: 'ssb',
    features: [
      {
        feature: 'rss-news',
        enabled: true
      },
      {
        feature: 'rss-news-statistics',
        enabled: false
      },
      {
        feature: 'article-isbn',
        enabled: true
      }
    ]
  }
])

const now = new Date()
log.info(`Startup script complete: ${now.toISOString()}`)
