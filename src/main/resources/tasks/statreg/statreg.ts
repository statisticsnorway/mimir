import {libScheduleTest, libScheduleTestLog} from '/lib/ssb/cron/cron'
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
import { createOrUpdateStatisticsRepo } from '/lib/ssb/repo/statisticVariant'


const statregCron: string =
app.config && app.config['ssb.cron.statreg'] ? app.config['ssb.cron.statreg'] : '30 14 * * *'

export function run(): void {
  libScheduleTestLog('statregRefreshCronTest', statregCron)

  const jobLogNode: JobEventNode = startJobLog(JobNames.STATREG_JOB)
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: STATREG_NODES.map((s: { key: any }) => s.key),
      }
      return node
    })
    const result: Array<StatRegRefreshResult> = refreshStatRegData()
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, result)
    createOrUpdateStatisticsRepo()

  libScheduleTest({ name: 'statregRefreshCronTest', cron: '05 8 * * *', timeZone: 'Europe/Oslo' }, statregCron)
}