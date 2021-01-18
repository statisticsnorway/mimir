import { AuthLibrary, UserQueryResult } from 'enonic-types/auth'
import { Content } from 'enonic-types/content'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { RepoJobLib, JobEventNode, JobInfoNode } from '../repo/job'
import { StatRegRefreshResult, StatRegRepoLib } from '../repo/statreg'
import { SSBTaskLib } from '../task'
import { CronLib, GetCronResult } from '../types/cron'
import { DatasetLib } from './dataset/dataset'
import { PublishDatasetLib } from './dataset/publish'
import { EventLogLib } from '../ssb/eventLog'
import { ClusterLib } from '../types/cluster'
import { ServerLogLib } from './serverLog'
import { DatasetRSSLib } from './dataset/rss'

const {
  publishDataset
}: PublishDatasetLib = __non_webpack_require__( '/lib/ssb/dataset/publish')
const {
  refreshStatRegData,
  STATREG_NODES
}: StatRegRepoLib = __non_webpack_require__( '/lib/repo/statreg')
const cron: CronLib = __non_webpack_require__('/lib/cron')
const {
  refreshQueriesAsync
}: SSBTaskLib = __non_webpack_require__('/lib/task')
const {
  getContentWithDataSource
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')
const {
  dataSourceRSSFilter
}: DatasetRSSLib = __non_webpack_require__('/lib/ssb/dataset/rss')
const {
  findUsers,
  createUser
}: AuthLibrary = __non_webpack_require__('/lib/xp/auth')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  deleteExpiredEventLogs
}: EventLogLib = __non_webpack_require__('/lib/ssb/eventLog')
const {
  isMaster
}: ClusterLib = __non_webpack_require__('/lib/xp/cluster')
const {
  cronJobLog
}: ServerLogLib = __non_webpack_require__('/lib/ssb/serverLog')

const createUserContext: RunContext = { // Master context (XP)
  repository: 'com.enonic.cms.default',
  branch: 'master',
  principals: ['role:system.admin'],
  user: {
    login: 'su',
    idProvider: 'system'
  }
}

const cronContext: RunContext = { // Master context (XP)
  repository: 'com.enonic.cms.default',
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
  cronJobLog('-- Running dataquery cron job --')
  const jobLogNode: JobEventNode = startJobLog('-- Running dataquery cron job --')

  let dataSourceQueries: Array<Content<DataSource>> = getContentWithDataSource()
  dataSourceQueries = dataSourceRSSFilter(dataSourceQueries)
  updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: dataSourceQueries.map((q) => q._id)
    }
    return node
  })
  const refreshDataResult: undefined | Array<string> = dataSourceQueries && refreshQueriesAsync(dataSourceQueries)
  completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, refreshDataResult)
  cronJobLog('-- Completed dataquery cron job --')
}

function statRegJob(): void {
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

function runOnMasterOnly(task: () => void): void {
  if (isMaster()) {
    task()
  }
}

export function setupCronJobs(): void {
  run(createUserContext, setupCronJobUser)

  // setup dataquery cron job
  const dataqueryCron: string = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'
  cron.schedule({
    name: 'Data from datasource endpoints',
    cron: dataqueryCron,
    times: 365 * 10,
    callback: () => runOnMasterOnly(job),
    context: cronContext
  })

  // and setup a cron for periodic executions in the future
  const statregCron: string = app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
  cron.schedule({
    name: 'StatReg Periodic Refresh',
    cron: statregCron,
    times: 365 * 10,
    callback: () => runOnMasterOnly(statRegJob),
    context: cronContext
  })

  // publish dataset cron job
  const datasetPublishCron: string = app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 05 * * *'
  cron.schedule({
    name: 'Dataset publish',
    cron: datasetPublishCron,
    times: 365 * 10,
    callback: () => runOnMasterOnly(publishDataset),
    context: cronContext
  })

  const deleteExpiredEventLogCron: string = app.config && app.config['ssb.cron.deleteLogs'] ? app.config['ssb.cron.deleteLogs'] : '45 13 * * *'
  cron.schedule({
    name: 'Deleting expired eventlogs',
    cron: deleteExpiredEventLogCron,
    times: 365 * 10,
    callback: () => runOnMasterOnly(deleteExpiredEventLogs),
    context: cronContext
  })

  const cronList: Array<GetCronResult> = cron.list()
  cronJobLog('All cron jobs registered')
  cronJobLog(JSON.stringify(cronList, null, 2))
}

export interface SSBCronLib {
    setupCronJobs: () => void;
}
