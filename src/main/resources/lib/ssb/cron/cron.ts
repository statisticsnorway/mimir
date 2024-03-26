/* eslint-disable complexity */
import { createUser, findUsers } from '/lib/xp/auth'
import { type Content } from '/lib/xp/content'
import { run, type ContextParams } from '/lib/xp/context'
import { create, get as getScheduledJob, modify, delete as deleteScheduledJob } from '/lib/xp/scheduler'
import { isMaster } from '/lib/xp/cluster'
import {
  type JobEventNode,
  type JobInfoNode,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames,
} from '/lib/ssb/repo/job'
import { type StatRegRefreshResult, refreshStatRegData, STATREG_NODES } from '/lib/ssb/repo/statreg'
import { list, schedule, type TaskMapper } from '/lib/cron'
import { type RSSFilter, dataSourceRSSFilter } from '/lib/ssb/cron/rss'
import { updateSDDSTables } from '/lib/ssb/cron/updateSDDSTables'

import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'
import { refreshQueriesAsync } from '/lib/ssb/cron/task'
import { getContentWithDataSource } from '/lib/ssb/dataset/dataset'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'
import { updateUnpublishedMockTbml } from '/lib/ssb/dataset/mockUnpublished'
import { pushRssNews } from '/lib/ssb/cron/pushRss'
import { publishDataset } from '/lib/ssb/dataset/publishOld'
import { isEnabled } from '/lib/featureToggle'
import { createOrUpdateStatisticsRepo } from '/lib/ssb/repo/statisticVariant'
import { type DataSource } from '/site/mixins/dataSource'

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

function libScheduleTest(params: { name: string; cron: string; timeZone: string }, cronLibCron: string) {
  if (!isMaster()) return
  try {
    log.info(
      `Scheduling lib-sheduler test for ${params.name} at ${params.cron} with timezone ${params.timeZone}, libCron was scheduled with ${cronLibCron}`
    )

    run(cronContext, () => {
      deleteScheduledJob({
        name: params.name!,
      })

      create({
        name: params.name!,
        descriptor: 'mimir:libSchedulerTester',
        user: `user:system:cronjob`,
        enabled: true,
        schedule: {
          type: 'CRON',
          value: params.cron,
          timeZone: params.timeZone,
        },
        config: {
          name: params.name,
          cronLibCron,
          cron: params.cron,
          timeZone: params.timeZone,
        },
      })
    })
  } catch (e) {
    log.error('Error in libScheduleTest', e)
  }
}
function libScheduleTestLog(name: string, cron: string): void {
  log.info(`libSchedulerTester - cron - ${name} was set to run at ${cron} and is running at ${new Date()}`)
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
    callback: () => {
      libScheduleTestLog('dataqueryCronTest', dataqueryCron)
      runOnMasterOnly(job)
    },
    context: cronContext,
  })
  // using config in https://github.com/statisticsnorway/mimir-config/blob/master/prod/mimir.cfg as base
  libScheduleTest({ name: 'dataqueryCronTest', cron: '03 08 * * *', timeZone: 'Europe/Oslo' }, dataqueryCron)

  // clear calculator parts cache cron
  const clearCalculatorPartsCacheCron: string =
    app.config && app.config['ssb.cron.clearCalculatorCache']
      ? app.config['ssb.cron.clearCalculatorCache']
      : '15 07 * * *'

  schedule({
    name: 'Clear calculator parts cache',
    cron: clearCalculatorPartsCacheCron,
    callback: () => {
      libScheduleTestLog('clearCalculatorCronTest', clearCalculatorPartsCacheCron)
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
    },
    context: cronContext,
  })
  libScheduleTest(
    { name: 'clearCalculatorCronTest', cron: '15 08 * * *', timeZone: 'Europe/Oslo' },
    clearCalculatorPartsCacheCron
  )

  // and setup a cron for periodic executions in the future
  const statregCron: string =
    app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'
  schedule({
    name: 'StatReg Periodic Refresh',
    cron: statregCron,
    callback: () => {
      libScheduleTestLog('statregRefreshCronTest', statregCron)
      runOnMasterOnly(statRegJob)
    },
    context: cronContext,
  })
  libScheduleTest({ name: 'statregRefreshCronTest', cron: '05 8 * * *', timeZone: 'Europe/Oslo' }, statregCron)

  // Update repo no.ssb.statistic.variant
  const updateStatisticRepoCron: string =
    app.config && app.config['ssb.cron.updateStatisticRepo'] ? app.config['ssb.cron.updateStatisticRepo'] : '0 7 * * *'

  schedule({
    name: 'Update no.ssb.statistics Repo',
    cron: updateStatisticRepoCron,
    callback: () => {
      libScheduleTestLog('statregUpdateCronTest', updateStatisticRepoCron)
      runOnMasterOnly(createOrUpdateStatisticsRepo)
    },
    context: cronContext,
  })
  libScheduleTest(
    { name: 'statregUpdateCronTest', cron: '0 8 * * *', timeZone: 'Europe/Oslo' },
    updateStatisticRepoCron
  )

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
    callback: () => {
      libScheduleTestLog('pushRssNewsCronTest', pushRssNewsCron)
      runOnMasterOnly(pushRssNewsJob)
    },
    context: cronContext,
  })
  libScheduleTest({ name: 'pushRssNewsCronTest', cron: '01 08 * * *', timeZone: 'Europe/Oslo' }, pushRssNewsCron)

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
    callback: () => {
      libScheduleTestLog('updateSDDSCronTest', updateSDDSTablesCron)
      runOnMasterOnly(updateSDDSTables)
    },
    context: cronContext,
  })
  libScheduleTest({ name: 'updateSDDSCronTest', cron: '01 09 * * *', timeZone: 'Europe/Oslo' }, updateSDDSTablesCron)

  const datasetPublishCron: string =
    app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 05 * * *'

  log.info('Run old datasetPublishCron cron-library')
  // publish dataset cron job
  schedule({
    name: 'Dataset publish',
    cron: datasetPublishCron,
    callback: () => {
      libScheduleTestLog('datasetPublishCronTest', datasetPublishCron)
      runOnMasterOnly(publishDataset)
    },
    context: cronContext,
  })
  libScheduleTest({ name: 'datasetPublishCronTest', cron: '50 07 * * *', timeZone: 'Europe/Oslo' }, datasetPublishCron)

  // Task
  if (isMaster()) {
    const timezone: string =
      app.config && app.config['ssb.cron.timezone'] ? app.config['ssb.cron.timezone'] : 'Europe/Oslo'

    // Update calculators
    scheduleJob({
      name: 'updateCalculator',
      cronConfigName: 'ssb.cron.updateCalculator',
      description: 'Update data calculators',
      descriptor: 'updateCalculator',
      timeZone: timezone,
    })

    // Update next release Mimir QA
    if (app.config && app.config['ssb.mock.enable'] === 'true') {
      scheduleJob({
        name: 'updateMimirMockRelease',
        cronConfigName: 'ssb.cron.updateMimirReleasedMock',
        description: 'Update next release Mimir QA',
        descriptor: 'updateMimirMockRelease',
        timeZone: timezone,
      })
    }

    // Push Rss Statkal
    const pushRssStatkalEnabled: boolean = isEnabled('push-rss-statkal', false, 'ssb')
    scheduleJob({
      name: 'pushRssStatkal',
      cronConfigName: 'ssb.cron.pushRssStatkal',
      description: 'Push kommende publiseringer til rss/statkal',
      descriptor: 'pushRssStatkal',
      timeZone: timezone,
      updateEnabledTo: pushRssStatkalEnabled,
    })

    // Delete expired event logs for queries
    scheduleJob({
      name: 'deleteExpiredEventLog',
      cronConfigName: 'ssb.cron.deleteLogs',
      description: 'Delete expired event logs for queries',
      descriptor: 'deleteExpiredEventLog',
      timeZone: timezone,
    })
  }

  const cronList: Array<TaskMapper> = list() as Array<TaskMapper>
  cronJobLog('All cron jobs registered')
  cronJobLog(JSON.stringify(cronList, null, 2))
}

type ScheduleJobParams = {
  name: string
  cronConfigName: string
  description: string
  descriptor: string
  timeZone?: string
  updateEnabledTo?: boolean | undefined
}

function scheduleJob({
  name,
  cronConfigName,
  description,
  descriptor,
  timeZone = 'Europe/Oslo',
  updateEnabledTo,
}: ScheduleJobParams) {
  run(cronContext, () => {
    const cronValue: string = app.config && app.config[cronConfigName] ? app.config[cronConfigName] : '0 12 * * *'
    const jobExists = !!getScheduledJob({
      name,
    })
    if (jobExists) {
      modify({
        name,
        editor: (job) => {
          if (updateEnabledTo !== undefined) job.enabled = updateEnabledTo

          job.schedule.value = cronValue
          if (job.schedule.type === 'CRON') {
            job.schedule.timeZone = timeZone
          }
          return job
        },
      })
    } else {
      create({
        name,
        descriptor: `${app.name}:${descriptor}`,
        description,
        user: `user:system:cronjob`,
        enabled: updateEnabledTo !== undefined ? updateEnabledTo : true,
        schedule: {
          type: 'CRON',
          value: cronValue,
          timeZone: timeZone,
        },
      })
    }
  })
}
