/* eslint-disable complexity */
import { createUser, findUsers } from '/lib/xp/auth'
import { run, type ContextParams } from '/lib/xp/context'
import { create, get as getScheduledJob, modify, delete as deleteScheduledJob } from '/lib/xp/scheduler'
import { isMaster } from '/lib/xp/cluster'
import { list, schedule, type TaskMapper } from '/lib/cron'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'
import { publishDataset } from '/lib/ssb/dataset/publishOld'

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

  const datasetPublishCron: string =
    app.config && app.config['ssb.cron.publishDataset'] ? app.config['ssb.cron.publishDataset'] : '50 06 * * *'

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
      description: 'Update data calculators',
      descriptor: 'updateCalculator',
      cronValue:
        app.config && app.config['ssb.task.updateCalculator'] ? app.config['ssb.task.updateCalculator'] : '01 8 * * *',
      timeZone: timezone,
    })

    // Update next release Mimir QA
    if (app.config && app.config['ssb.mock.enable'] === 'true') {
      scheduleJob({
        name: 'updateMimirMockRelease',
        description: 'Update next release Mimir QA',
        descriptor: 'updateMimirMockRelease',
        cronValue:
          app.config && app.config['ssb.task.updateMimirReleasedMock']
            ? app.config['ssb.task.updateMimirReleasedMock']
            : '01 8 * * *',
        timeZone: timezone,
      })
    }

    // Push RSS Statkal
    scheduleJob({
      name: 'pushRssStatkal',
      description: 'Push kommende publiseringer til rss/statkal',
      descriptor: 'pushRssStatkal',
      cronValue:
        app.config && app.config['ssb.task.pushRssStatkal'] ? app.config['ssb.task.pushRssStatkal'] : '10 08 * * *',
      timeZone: timezone,
    })

    // Delete expired event logs for queries
    scheduleJob({
      name: 'deleteExpiredEventLog',
      description: 'Delete expired event logs for queries',
      descriptor: 'deleteExpiredEventLog',
      cronValue: app.config && app.config['ssb.task.deleteLogs'] ? app.config['ssb.task.deleteLogs'] : '20 14 * * *',
      timeZone: timezone,
    })

    // dataquery
    scheduleJob({
      name: 'dataquery',
      description: 'Data from datasource endpoints',
      descriptor: 'dataquery',
      cronValue: app.config && app.config['ssb.task.dataquery'] ? app.config['ssb.task.dataquery'] : '03 08 * * *',
      timeZone: timezone,
    })

    // clear calculator parts cache
    scheduleJob({
      name: 'clearCalculatorPartsCache',
      description: 'Clear calculator parts cache',
      descriptor: 'clearCalculatorPartsCache',
      cronValue:
        app.config && app.config['ssb.task.clearCalculatorCache']
          ? app.config['ssb.task.clearCalculatorCache']
          : '15 08 * * *',
      timeZone: timezone,
    })

    // statreg
    scheduleJob({
      name: 'statreg',
      description: 'StatReg Periodic Refresh',
      descriptor: 'statreg',
      cronValue: app.config && app.config['ssb.task.statreg'] ? app.config['ssb.task.statreg'] : '05 08 * * *',
      timeZone: timezone,
    })

    // updateUnpublishedMock
    if (app.config && app.config['ssb.mock.enable'] === 'true') {
      scheduleJob({
        name: 'updateUnpublishedMock',
        description: 'Update unpublished mock tbml',
        descriptor: 'updateUnpublishedMock',
        cronValue:
          app.config && app.config['ssb.task.updateUnpublishedMock']
            ? app.config['ssb.task.updateUnpublishedMock']
            : '0 04 * * *',
        timeZone: timezone,
      })
    }

    // push news to rss feed
    scheduleJob({
      name: 'pushRssNews',
      description: 'Push RSS news',
      descriptor: 'pushRssNews',
      cronValue: app.config && app.config['ssb.task.pushRssNews'] ? app.config['ssb.task.pushRssNews'] : '01 08 * * *',
      timeZone: timezone,
    })

    // clear specific cache once an hour
    scheduleJob({
      name: 'clearCache',
      description: 'Clear cache',
      descriptor: 'clearCache',
      cronValue: '01 * * * *',
      timeZone: timezone,
    })

    // Update SDDS tables
    scheduleJob({
      name: 'updateSDDSTables',
      description: 'Update SDDS Tables',
      descriptor: 'updateSDDSTables',
      cronValue:
        app.config && app.config['ssb.task.updateSDDSTables'] ? app.config['ssb.task.updateSDDSTables'] : '01 09 * * *',
      timeZone: timezone,
    })

    // Update frontpage keyfigures
    scheduleJob({
      name: 'updateFrontpageKeyfigures',
      description: 'Update Frontpage Keyfigures',
      descriptor: 'updateFrontpageKeyfigures',
      cronValue:
        app.config && app.config['ssb.task.updateFrontpageKeyfigures']
          ? app.config['ssb.task.updateFrontpageKeyfigures']
          : '0 8 * * *',
      timeZone: timezone,
    })

    // Update statistic Repo
    scheduleJob({
      name: 'updateStatisticRepo',
      description: 'Update no.ssb.statistics Repo',
      descriptor: 'updateStatisticRepo',
      cronValue:
        app.config && app.config['ssb.task.updateStatisticRepo']
          ? app.config['ssb.task.updateStatisticRepo']
          : '0 8 * * *',
      timeZone: timezone,
    })
  }

  const cronList: Array<TaskMapper> = list() as Array<TaskMapper>
  cronJobLog('All cron jobs registered')
  cronJobLog(JSON.stringify(cronList, null, 2))
}

type ScheduleJobParams = {
  name: string
  description: string
  descriptor: string
  cronValue: string
  timeZone?: string
  updateEnabledTo?: boolean | undefined
}

function scheduleJob({
  name,
  description,
  descriptor,
  cronValue,
  timeZone = 'Europe/Oslo',
  updateEnabledTo,
}: ScheduleJobParams) {
  run(cronContext, () => {
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
