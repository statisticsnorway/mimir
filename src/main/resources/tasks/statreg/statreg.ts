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
import { isEnabled } from '/lib/featureToggle'

export function run(): void {
  if (!isEnabled('new-statreg-as-source', false, 'ssb')) {
    log.info(`Run Task: refreshStatRegData ${new Date()}`)
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
}
