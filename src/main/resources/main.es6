try {
  const {
    setupEventLog
  } = __non_webpack_require__('/lib/ssb/repo/eventLog')
  const {
    setupStatRegRepo
  } = __non_webpack_require__('/lib/ssb/repo/statreg')
  const {
    setupDatasetRepo
  } = __non_webpack_require__('/lib/ssb/repo/dataset')
  const cache = __non_webpack_require__('/lib/ssb/cache/cache')
  const {
    setupFetchDataOnCreateListener
  } = __non_webpack_require__('/lib/ssb/dataset/listeners')
  const {
    setupCronJobs
  } = __non_webpack_require__('/lib/ssb/cron/cron')
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
        },
        {
          feature: 'articlelist-sorting',
          enabled: false
        },
        {
          feature: 'name-graph',
          enabled: false
        },
        {
          feature: 'dashboard-redux-logging-debugging',
          enabled: true
        },
        {
          feature: 'enable-enalyzer-script',
          enabled: false
        }
      ]
    }
  ])

  const now = new Date()
  log.info(`Startup script complete: ${now.toISOString()}`)
} catch (e) {
  log.info(`Failed to start Mimir application :: ${e.toString()}`)
}
