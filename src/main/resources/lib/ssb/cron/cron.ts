import { createUser, findUsers } from '/lib/xp/auth'
import type { Content } from '/lib/xp/content'
import { run, type ContextParams } from '/lib/xp/context'
import type { DataSource } from '/site/mixins/dataSource'
import type { JobEventNode, JobInfoNode } from '/lib/ssb/repo/job'
import type { StatRegRefreshResult } from '/lib/ssb/repo/statreg'
import { list, schedule, type TaskMapper } from '/lib/cron'
import type { RSSFilter } from '/lib/ssb/cron/rss'
import { create, get as getScheduledJob, list as listScheduledJobs, modify, type ScheduledJob } from '/lib/xp/scheduler'
import { updateSDDSTables } from '/lib/ssb/cron/updateSDDSTables'

const { clearPartFromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { refreshStatRegData, STATREG_NODES } = __non_webpack_require__('/lib/ssb/repo/statreg')
const { refreshQueriesAsync } = __non_webpack_require__('/lib/ssb/cron/task')
const { getContentWithDataSource } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { completeJobLog, startJobLog, updateJobLog, JOB_STATUS_COMPLETE, JobNames } =
  __non_webpack_require__('/lib/ssb/repo/job')
const { dataSourceRSSFilter } = __non_webpack_require__('/lib/ssb/cron/rss')
const { deleteExpiredEventLogsForQueries } = __non_webpack_require__('/lib/ssb/cron/eventLog')
const { isMaster } = __non_webpack_require__('/lib/xp/cluster')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const { ENONIC_CMS_DEFAULT_REPO } = __non_webpack_require__('/lib/ssb/repo/common')
const { updateUnpublishedMockTbml } = __non_webpack_require__('/lib/ssb/dataset/mockUnpublished')
const { pushRssNews, pushRssStatkal } = __non_webpack_require__('/lib/ssb/cron/pushRss')
const { publishDataset } = __non_webpack_require__('/lib/ssb/dataset/publishOld')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const { createOrUpdateStatisticsRepo } = __non_webpack_require__('/lib/ssb/repo/statisticVariant')

const createUserContext: ContextParams = {
  // Master context (XP)
  repository: ENONIC_CMS_DEFAULT_REPO,
  branch: 'master',
  principals: ['role:system.admin'],
  user: {
    login: 'su',
    idProvider: 'system',
  },
}

const newPublishJobEnabled: boolean = isEnabled('publishJob-lib-sheduler', false, 'ssb')

export const cronContext: ContextParams = {
  // Master context (XP)
  repository: ENONIC_CMS_DEFAULT_REPO,
  branch: 'master',
  principals: ['role:system.admin'],
  user: {
    login: 'cronjob',
    idProvider: 'system',
  },
}

function setupCronJobUser(): void {
  const findUsersResult = findUsers({
    count: 1,
    query: `login LIKE "cronjob"`,
  })
  if (findUsersResult.hits.length === 0) {
    createUser({
      idProvider: 'system',
      name: 'cronjob',
      displayName: 'Carl Cronjob',
      email: 'cronjob@ssb.no',
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
      queryIds: dataSourceQueries.map((q) => q._id),
    }
    return node
  })
  if (dataSourceQueries && dataSourceQueries.length > 1) {
    refreshQueriesAsync(dataSourceQueries, jobLogNode._id, filterData.logData)
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      filterInfo: filterData.logData,
      result: [],
    })
  }
  cronJobLog(JobNames.REFRESH_DATASET_JOB)
}

export function statRegJob(): void {
  const jobLogNode: JobEventNode = startJobLog(JobNames.STATREG_JOB)
  updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: STATREG_NODES.map((s) => s.key),
    }
    return node
  })
  const result: Array<StatRegRefreshResult> = refreshStatRegData()
  completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, result)
  createOrUpdateStatisticsRepo()
}

function pushRssNewsJob(): void {
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_NEWS)
  const result: string = pushRssNews()
  completeJobLog(jobLogNode._id, result, {
    result,
  })
}

function pushRssStatkalJob(): void {
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_STATKAL)
  const result: string = pushRssStatkal()
  completeJobLog(jobLogNode._id, result, {
    result,
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
  const dataqueryCron: string =
    app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'
  schedule({
    name: 'Data from datasource endpoints',
    cron: dataqueryCron,
    callback: () => runOnMasterOnly(job),
    context: cronContext,
  })

  // clear calculator parts cache cron
  const clearCalculatorPartsCacheCron: string =
    app.config && app.config['ssb.cron.clearCalculatorCache']
      ? app.config['ssb.cron.clearCalculatorCache']
      : '15 07 * * *'

  schedule({
    name: 'Clear calculator parts cache',
    cron: clearCalculatorPartsCacheCron,
    callback: () => {
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
    },
    context: cronContext,
  })

  // and setup a cron for periodic executions in the future
  const statregCron: string =
    app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
  schedule({
    name: 'StatReg Periodic Refresh',
    cron: statregCron,
    callback: () => runOnMasterOnly(statRegJob),
    context: cronContext,
  })

  // Update repo no.ssb.statistic.variant
  const updateStatisticRepoCron: string =
    app.config && app.config['ssb.cron.updateStatisticRepo'] ? app.config['ssb.cron.updateStatisticRepo'] : '0 7 * * *'

  schedule({
    name: 'Update no.ssb.statistics Repo',
    cron: updateStatisticRepoCron,
    callback: () => runOnMasterOnly(createOrUpdateStatisticsRepo),
    context: cronContext,
  })

  const deleteExpiredEventLogCron: string =
    app.config && app.config['ssb.cron.deleteLogs'] ? app.config['ssb.cron.deleteLogs'] : '45 13 * * *'
  schedule({
    name: 'Delete expired event logs for queries',
    cron: deleteExpiredEventLogCron,
    callback: () => runOnMasterOnly(deleteExpiredEventLogsForQueries),
    context: cronContext,
  })

  if (app.config && app.config['ssb.mock.enable'] === 'true') {
    const updateUnpublishedMockCron: string =
      app.config && app.config['ssb.cron.updateUnpublishedMock']
        ? app.config['ssb.cron.updateUnpublishedMock']
        : '0 04 * * *'
    schedule({
      name: 'Update unpublished mock tbml',
      cron: updateUnpublishedMockCron,
      callback: () => runOnMasterOnly(updateUnpublishedMockTbml),
      context: cronContext,
    })
  }

  // push news to rss feed
  const pushRssNewsCron: string =
    app.config && app.config['ssb.cron.pushRssNews'] ? app.config['ssb.cron.pushRssNews'] : '02 06 * * *'
  schedule({
    name: 'Push RSS news',
    cron: pushRssNewsCron,
    callback: () => runOnMasterOnly(pushRssNewsJob),
    context: cronContext,
  })

  // push statkalReleases to rss feed
  const pushRssStatkalCron: string =
    app.config && app.config['ssb.cron.pushRssStatkal'] ? app.config['ssb.cron.pushRssStatkal'] : '03 06 * * *'
  schedule({
    name: 'Push RSS statkal',
    cron: pushRssStatkalCron,
    callback: () => runOnMasterOnly(pushRssStatkalJob),
    context: cronContext,
  })

  // clear specific cache once an hour
  const clearCacheCron: string =
    app.config && app.config['ssb.cron.clearCacheCron'] ? app.config['ssb.cron.clearCacheCron'] : '01 * * * *'
  schedule({
    name: 'clear cache',
    cron: clearCacheCron,
    callback: () => {
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
      clearPartFromPartCache('omStatistikken')
      clearPartFromPartCache('releasedStatistics')
      clearPartFromPartCache('upcomingReleases')
      clearPartFromPartCache('articleList')
      clearPartFromPartCache('relatedFactPage')
      clearPartFromPartCache('archiveAllPublications-nb')
      clearPartFromPartCache('archiveAllPublications-en')
    },
    context: cronContext,
  })

  // Update SDDS tables
  const updateSDDSTablesCron: string =
    app.config && app.config['ssb.cron.updateSDDSTables'] ? app.config['ssb.cron.updateSDDSTables'] : '01 09 * * *'
  schedule({
    name: 'Update SDDS tables',
    cron: updateSDDSTablesCron,
    callback: () => runOnMasterOnly(updateSDDSTables),
    context: cronContext,
  })

  // Task
  const testTaskCron: string =
    app.config && app.config['ssb.cron.testTask'] ? app.config['ssb.cron.testTask'] : '0 08 * * *'
  const datasetPublishCron: string =
    app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 05 * * *'
  const updateMimirMockReleaseCron: string =
    app.config && app.config['ssb.cron.updateMimirReleasedMock']
      ? app.config['ssb.cron.updateMimirReleasedMock']
      : '01 8 * * *'
  const updateCalculatorCron: string =
    app.config && app.config['ssb.cron.updateCalculator'] ? app.config['ssb.cron.updateCalculator'] : '01 8 * * *'
  const timezone: string = app.config && app.config['ssb.cron.timezone'] ? app.config['ssb.cron.timezone'] : 'UTC'

  // Use feature-toggling to switch to lib-sheduler when testet in QA
  if (!newPublishJobEnabled) {
    log.info('Run old datasetPublishCron cron-library')
    // publish dataset cron job
    schedule({
      name: 'Dataset publish',
      cron: datasetPublishCron,
      callback: () => runOnMasterOnly(publishDataset),
      context: cronContext,
    })
  } else {
    log.info('Run new dailyPublishJob lib-scheduler')
  }

  if (isMaster()) {
    // publish dataset sheduler job
    run(cronContext, () => {
      const jobExists = !!getScheduledJob({
        name: 'dailyPublishJob',
      })
      if (jobExists) {
        modify({
          name: 'dailyPublishJob',
          editor: (job) => {
            job.enabled = newPublishJobEnabled
            job.schedule.value = datasetPublishCron
            if (job.schedule.type === 'CRON') {
              job.schedule.timeZone = timezone
            }
            return job
          },
        })
      } else {
        create({
          name: 'dailyPublishJob',
          descriptor: `${app.name}:publishJob`,
          description: 'Publishing all dataset for statistics',
          user: `user:system:cronjob`,
          enabled: newPublishJobEnabled,
          schedule: {
            type: 'CRON',
            value: datasetPublishCron,
            timeZone: timezone,
          },
        })
      }
      const schedulerList: Array<ScheduledJob> = listScheduledJobs()
      cronJobLog(JSON.stringify(schedulerList, null, 2))
    })

    // Test sheduler task
    run(cronContext, () => {
      const jobExists = !!getScheduledJob({
        name: 'testTask',
      })
      if (jobExists) {
        modify({
          name: 'testTask',
          editor: (job) => {
            job.schedule.value = testTaskCron
            if (job.schedule.type === 'CRON') {
              job.schedule.timeZone = timezone
            }
            return job
          },
        })
      } else {
        create({
          name: 'testTask',
          descriptor: `${app.name}:testTask`,
          description: 'Testing task',
          user: `user:system:cronjob`,
          enabled: true,
          schedule: {
            type: 'CRON',
            value: testTaskCron,
            timeZone: timezone,
          },
        })
      }
    })

    // Update calculators
    run(cronContext, () => {
      const jobExists = !!getScheduledJob({
        name: 'updateCalculator',
      })
      if (jobExists) {
        modify({
          name: 'updateCalculator',
          editor: (job) => {
            job.schedule.value = updateCalculatorCron
            return job
          },
        })
      } else {
        create({
          name: 'updateCalculator',
          descriptor: `${app.name}:updateCalculator`,
          description: 'Update data calculators',
          user: `user:system:cronjob`,
          enabled: true,
          schedule: {
            type: 'CRON',
            value: updateCalculatorCron,
            timeZone: 'Europe/Oslo',
          },
        })
      }
    })

    // Update next release Mimir QA
    if (app.config && app.config['ssb.mock.enable'] === 'true') {
      run(cronContext, () => {
        const jobExists = !!getScheduledJob({
          name: 'updateMimirMockRelease',
        })
        if (jobExists) {
          modify({
            name: 'updateMimirMockRelease',
            editor: (job) => {
              job.schedule.value = updateMimirMockReleaseCron
              return job
            },
          })
        } else {
          create({
            name: 'updateMimirMockRelease',
            descriptor: `${app.name}:updateMimirMockRelease`,
            description: 'Update next release Mimir QA',
            user: `user:system:cronjob`,
            enabled: true,
            schedule: {
              type: 'CRON',
              value: updateMimirMockReleaseCron,
              timeZone: 'Europe/Oslo',
            },
          })
        }
      })
    }
  }

  const cronList: Array<TaskMapper> = list() as Array<TaskMapper>
  cronJobLog('All cron jobs registered')
  cronJobLog(JSON.stringify(cronList, null, 2))
}

export interface SSBCronLib {
  setupCronJobs: () => void
  runOnMasterOnly: (task: () => void) => void
  cronContext: ContextParams
}
