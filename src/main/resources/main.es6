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
          feature: 'rss-news',
          enabled: true,
        },
        {
          feature: 'rss-news-statistics',
          enabled: false,
        },
        {
          feature: 'article-isbn',
          enabled: true,
        },
        {
          feature: 'articlelist-sorting',
          enabled: false,
        },
        {
          feature: 'name-graph',
          enabled: false,
        },
        {
          feature: 'dashboard-redux-logging-debugging',
          enabled: true,
        },
        {
          feature: 'highchart-show-datatable',
          enabled: false,
        },
        {
          feature: 'highchart-react',
          enabled: false,
        },
        {
          feature: 'highcharts-y-axix-title-mobile',
          enabled: false,
        },
        {
          feature: 'name-search-in-freetext-search',
          enabled: false,
        },
        {
          feature: 'deactivate-partcache-released-statistics',
          enabled: true,
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
          feature: 'datefns-publication-archive',
          enabled: false,
        },
        {
          feature: 'push-rss-statkal',
          enabled: false,
        },
        {
          feature: 'highchart-expert',
          enabled: false,
        },
        {
          feature: 'gpt-service',
          enabled: false,
        },
        {
          feature: 'hide-header-in-qa',
          enabled: false,
        },
        {
          feature: 'simple-statbank-part',
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
