import { AuthLibrary, UserQueryResult } from 'enonic-types/auth'
import { Content } from 'enonic-types/content'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { RepoJobLib, JobEventNode, JobInfoNode } from '../repo/job'
import { StatRegRepoLib } from '../repo/statreg'
import { SSBTaskLib } from '../task'
import { CronLib } from '../types/cron'
import { DatasetLib } from './dataset/dataset'
import { PublishDatasetLib } from './dataset/publish'
import { EventLogLib } from '../ssb/eventLog';

const {
  publishDataset
}: PublishDatasetLib = __non_webpack_require__( '/lib/ssb/dataset/publish')
const {
  fetchStatRegData
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
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')
const {
  dataSourceRSSFilter
} = __non_webpack_require__('/lib/ssb/dataset/rss')
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
  log.info('-- Running dataquery cron job --')
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
  log.info('-- Completed dataquery cron job --')
}

export function setupCronJobs(): void {
  run(createUserContext, setupCronJobUser)

  // setup dataquery cron job
  const dataqueryCron: string = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'
  cron.schedule({
    name: 'Data from datasource endpoints',
    cron: dataqueryCron,
    times: 365 * 10,
    callback: job,
    context: cronContext
  })

  // and setup a cron for periodic executions in the future
  const statregCron: string = app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
  cron.schedule({
    name: 'StatReg Periodic Refresh',
    cron: statregCron,
    times: 365 * 10,
    callback: fetchStatRegData,
    context: cronContext
  })

  // publish dataset cron job
  const datasetPublishCron: string = app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 05 * * *'
  cron.schedule({
    name: 'Dataset publish',
    cron: datasetPublishCron,
    times: 365 * 10,
    callback: publishDataset,
    context: cronContext
  })

  const deleteExpiredEventLogCron: string = app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '45 13 * * *'
  cron.schedule({
    name: 'Delete expired event logs',
    cron: deleteExpiredEventLogCron,
    times: 365 * 10,
    callback: deleteExpiredEventLogs,
    context: cronContext
  })
}

export interface SSBCronLib {
    setupCronJobs: () => void;
}
