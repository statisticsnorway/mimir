/* eslint-disable complexity */
import { createUser, findUsers } from '/lib/xp/auth'
import { run, type ContextParams } from '/lib/xp/context'
import { create, get as getScheduledJob, modify, delete as deleteScheduledJob } from '/lib/xp/scheduler'
import { isMaster } from '/lib/xp/cluster'
import { list, schedule, type TaskMapper } from '/lib/cron'
import { updateSDDSTables } from '/lib/ssb/cron/updateSDDSTables'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'
import { publishDataset } from '/lib/ssb/dataset/publishOld'
import { isEnabled } from '/lib/featureToggle'
import { createOrUpdateStatisticsRepo } from '/lib/ssb/repo/statisticVariant'

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

export function libScheduleTest(params: { name: string; cron: string; timeZone: string }, cronLibCron: string) {
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
export function libScheduleTestLog(name: string, cron: string): void {
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

export function runOnMasterOnly(task: () => void): void {
  if (isMaster()) {
    task()
  }
}

export function setupCronJobs(): void {
  run(createUserContext, setupCronJobUser)

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

    // Push RSS Statkal
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

    // dataquery
    scheduleJob({
      name: 'dataquery',
      cronConfigName: 'ssb.cron.dataquery',
      description: 'Data from datasource endpoints',
      descriptor: 'dataquery',
      timeZone: timezone,
    })

    // clear calculator parts cache 
    scheduleJob({
      name: 'clearCalculatorPartsCache',
      cronConfigName: 'clearCalculatorPartsCacheCron',
      description: 'Clear calculator parts cache',
      descriptor: 'clearCalculatorPartsCache',
      timeZone: timezone,
    })

    // statreg
    scheduleJob({
      name: 'statreg',
      cronConfigName: 'ssb.cron.statreg',
      description: 'StatReg Periodic Refresh',
      descriptor: 'statreg',
      timeZone: timezone,
    })

    // updateUnpublishedMock
    if (app.config && app.config['ssb.mock.enable'] === 'true') {
      scheduleJob({
        name: 'updateUnpublishedMock',
        cronConfigName: 'ssb.cron.updateUnpublishedMock',
        description: 'Update unpublished mock tbml',
        descriptor: 'updateUnpublishedMock',
        timeZone: timezone,
      })
    }

    // push news to rss feed
    scheduleJob({
      name: 'pushRssNews',
      cronConfigName: 'ssb.cron.pushRssNews',
      description: 'Push RSS news',
      descriptor: 'pushRssNews',
      timeZone: timezone,
    })

    // clear specific cache once an hour
    scheduleJob({
      name: 'clearCache',
      cronConfigName: 'ssb.cron.clearCacheCron',
      description: 'Clear cache',
      descriptor: 'clearCache',
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
