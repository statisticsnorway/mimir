try {
  const { setupEventLog } = require('/lib/ssb/repo/eventLog')
  const { setupStatRegRepo } = require('/lib/ssb/repo/statreg')
  const { setupDatasetRepo } = require('/lib/ssb/repo/dataset')
  const { setupBestBetRepo } = require('/lib/ssb/repo/bestbet')
  const cache = require('/lib/ssb/cache/cache')
  const { setupFetchDataOnCreateListener } = require('/lib/ssb/dataset/listeners')
  const { setupCronJobs } = require('/lib/ssb/cron/cron')
  const { create } = require('/lib/featureToggle')
  const { setupTaskListener } = require('/lib/ssb/dataset/publish')
  const { setupArticleListener } = require('/lib/ssb/utils/articleUtils')

  log.info('Application ' + app.name + ' started') // Log application started
  __.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

  cache.setup()
  setupEventLog()
  setupDatasetRepo()
  setupStatRegRepo()
  setupBestBetRepo()
  setupFetchDataOnCreateListener()
  setupCronJobs()
  setupTaskListener()
  setupArticleListener()

  create([
    {
      space: 'ssb',
      features: [
        {
          feature: 'articlelist-sorting',
          enabled: false,
        },
        {
          feature: 'highchart-react',
          enabled: false,
        },
        {
          feature: 'deactivate-part-cache-article-list',
          enabled: true,
        },
        {
          feature: 'new-publication-archive',
          enabled: false,
        },
        {
          feature: 'highchart-expert',
          enabled: false,
        },
        {
          feature: 'hide-header-in-qa',
          enabled: false,
        },
        {
          feature: 'structured-data',
          enabled: false,
        },
        {
          feature: 'show-popup-survey',
          enabled: false,
        },
        {
          feature: 'show-cookie-banner',
          enabled: false,
        },
        {
          feature: 'test-publish-statistics-dataset-job-task',
          enabled: false,
        },
        {
          feature: 'use-jubileumslogo-150-years',
          enabled: false,
        },
      ],
    },
  ])

  const now = new Date()
  log.info(`Startup script complete: ${now.toISOString()}`)
} catch (e) {
  log.info(`Failed to start Mimir application :: ${e.toString()}`)
}
