import { UserQueryResult } from 'enonic-types/auth'
import { Content } from 'enonic-types/content'
import { RunContext } from 'enonic-types/context'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { JobEventNode, JobInfoNode } from '../repo/job'
import { StatRegRefreshResult } from '../repo/statreg'
import { TaskMapper } from 'enonic-types/cron'
import { RSSFilter } from './rss'

const {
  clearPartFromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  publishDataset
} = __non_webpack_require__('/lib/ssb/dataset/publish')
const {
  refreshStatRegData,
  STATREG_NODES
} = __non_webpack_require__('/lib/ssb/repo/statreg')
const {
  schedule,
  list
} = __non_webpack_require__('/lib/cron')
const {
  refreshQueriesAsync
} = __non_webpack_require__('/lib/ssb/cron/task')
const {
  getContentWithDataSource
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames
} = __non_webpack_require__('/lib/ssb/repo/job')
const {
  dataSourceRSSFilter
} = __non_webpack_require__('/lib/ssb/cron/rss')
const {
  findUsers,
  createUser
} = __non_webpack_require__('/lib/xp/auth')
const {
  run
} = __non_webpack_require__('/lib/xp/context')
const {
  deleteExpiredEventLogs
} = __non_webpack_require__('/lib/ssb/cron/eventLog')
const {
  isMaster
} = __non_webpack_require__('/lib/xp/cluster')
const {
  cronJobLog
} = __non_webpack_require__('/lib/ssb/utils/serverLog')
const {
  ENONIC_CMS_DEFAULT_REPO
} = __non_webpack_require__('/lib/ssb/repo/common')
const {
  updateUnpublishedMockTbml
} = __non_webpack_require__('/lib/ssb/dataset/mockUnpublished')
const {
  pushRssNews
} = __non_webpack_require__('/lib/ssb/cron/pushRss')

const createUserContext: RunContext = { // Master context (XP)
  repository: ENONIC_CMS_DEFAULT_REPO,
  branch: 'master',
  principals: ['role:system.admin'],
  user: {
    login: 'su',
    idProvider: 'system'
  }
}

export const cronContext: RunContext = { // Master context (XP)
  repository: ENONIC_CMS_DEFAULT_REPO,
  branch: 'master',
  principals: ['role:system.admin'],
  user: {
    login: 'cronjob',
    idProvider: 'system'
  }
}

function setupCronJobUser(): void {
  const findUsersResult: UserQueryResult<object> = findUsers({
    count: 1,
    query: `login LIKE "cronjob"`
  })
  if (findUsersResult.hits.length === 0) {
    createUser({
      idProvider: 'system',
      name: 'cronjob',
      displayName: 'Carl Cronjob',
      email: 'cronjob@ssb.no'
    })
  }
}

function job(): void {
  cronJobLog(JobNames.REFRESH_DATASET_JOB)
  const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_JOB)

  const filterData: RSSFilter = dataSourceRSSFilter(getContentWithDataSource())
  const dataSourceQueries: Array<Content<DataSource>> = filterData.filteredDataSources
  updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: dataSourceQueries.map((q) => q._id)
    }
    return node
  })
  if (dataSourceQueries && dataSourceQueries.length > 1) {
    refreshQueriesAsync(dataSourceQueries, jobLogNode._id, filterData.logData)
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      filterInfo: filterData.logData,
      result: []
    })
  }
  cronJobLog(JobNames.REFRESH_DATASET_JOB)
}

export function statRegJob(): void {
  const jobLogNode: JobEventNode = startJobLog(JobNames.STATREG_JOB)
  updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: STATREG_NODES.map((s) => s.key)
    }
    return node
  })
  const result: Array<StatRegRefreshResult> = refreshStatRegData()
  completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, result)
}

function pushRssNewsJob(): void {
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_NEWS)
  const result: string = pushRssNews()
  completeJobLog(jobLogNode._id, result, {
    result
  })
}

export function runOnMasterOnly(task: () => void): void {
  if (isMaster()) {
    task()
  }
}

export function setupCronJobs(): void {
  run(createUserContext, setupCronJobUser)

  // setup dataquery cron job
  const dataqueryCron: string = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'
  schedule({
    name: 'Data from datasource endpoints',
    cron: dataqueryCron,
    callback: () => runOnMasterOnly(job),
    context: cronContext
  })

  // and setup a cron for periodic executions in the future
  const statregCron: string = app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
  schedule({
    name: 'StatReg Periodic Refresh',
    cron: statregCron,
    callback: () => runOnMasterOnly(statRegJob),
    context: cronContext
  })

  // publish dataset cron job
  const datasetPublishCron: string = app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 05 * * *'
  schedule({
    name: 'Dataset publish',
    cron: datasetPublishCron,
    callback: () => runOnMasterOnly(publishDataset),
    context: cronContext
  })

  const deleteExpiredEventLogCron: string = app.config && app.config['ssb.cron.deleteLogs'] ? app.config['ssb.cron.deleteLogs'] : '45 13 * * *'
  schedule({
    name: 'Delete expired event logs',
    cron: deleteExpiredEventLogCron,
    callback: () => runOnMasterOnly(deleteExpiredEventLogs),
    context: cronContext
  })

  if (app.config && app.config['ssb.mock.enable'] === 'true') {
    const updateUnpublishedMockCron: string =
      app.config && app.config['ssb.cron.updateUnpublishedMock'] ? app.config['ssb.cron.updateUnpublishedMock'] : '0 04 * * *'
    schedule({
      name: 'Update unpublished mock tbml',
      cron: updateUnpublishedMockCron,
      callback: () => runOnMasterOnly(updateUnpublishedMockTbml),
      context: cronContext
    })
  }

  // push news to rss feed
  const pushRssNewsCron: string = app.config && app.config['ssb.cron.pushRssNews'] ? app.config['ssb.cron.pushRssNews'] : '02 06 * * *'
  schedule({
    name: 'Push RSS news',
    cron: pushRssNewsCron,
    callback: () => runOnMasterOnly(pushRssNewsJob),
    context: cronContext
  })

  // clear specific cache once an hour
  const clearCacheCron: string = app.config && app.config['ssb.cron.clearCacheCron'] ? app.config['ssb.cron.clearCacheCron'] : '01 * * * *'
  schedule({
    name: 'clear cache',
    cron: clearCacheCron,
    callback: () => {
      clearPartFromPartCache('omStatistikken')
      clearPartFromPartCache('releasedStatistics')
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('husleieCalculator')
    },
    context: cronContext
  })

  const cronList: Array<TaskMapper> = list() as Array<TaskMapper>
  cronJobLog('All cron jobs registered')
  cronJobLog(JSON.stringify(cronList, null, 2))
}

export interface SSBCronLib {
    setupCronJobs: () => void;
    runOnMasterOnly: (task: () => void) => void;
    cronContext: RunContext;
}
