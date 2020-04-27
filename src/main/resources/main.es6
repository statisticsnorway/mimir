const dataquery = __non_webpack_require__('/lib/dataquery')
const content = __non_webpack_require__( '/lib/xp/content')
const cron = __non_webpack_require__('/lib/cron')
const cache = __non_webpack_require__('/lib/ssb/cache')
const {
  createRepo, repoExisits
} = __non_webpack_require__('/lib/repo/repo')
const {
  createNodeInContext
} = __non_webpack_require__('/lib/repo/node')

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

const LOG_REPO_ID = 'no.ssb.datarequestlog'
const LOG_BRANCH_NAME = 'master'


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
    //logging
    dataquery.refreshDataset(row)
  })
}

cron.schedule({
  name: 'dataquery',
  cron: '0 9 * * *',
  times: 365 * 10,
  callback: job,
  context: master
})

cache.setup()

/**
 * Check if repo for data requests logging exists, else create repo.
 */
if (!repoExisits(LOG_REPO_ID, LOG_BRANCH_NAME)) {
  log.info(`Repo ${LOG_REPO_ID} was not found. Creating repo now`)
  const createRepoResult = createRepo(LOG_REPO_ID, LOG_BRANCH_NAME)

  log.info('Creating sub nodes')
  const jobResult = createNodeInContext({
    _path: 'jobs',
    _name: 'jobs'
  })
  const queryResult = createNodeInContext({
    _path: 'queries',
    _name: 'queries'
  })
} else {
  log.info(`Repo ${LOG_REPO_ID} found.`)
}
