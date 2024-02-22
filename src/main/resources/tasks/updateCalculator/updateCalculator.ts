import { Content } from '/lib/xp/content'
import { CreateOrUpdateStatus, refreshDataset } from '/lib/ssb/dataset/dataset'
import {
  JobEventNode,
  JobInfoNode,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames,
} from '/lib/ssb/repo/job'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'

import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { getAllCalculatorDataset } from '/lib/ssb/dataset/calculator'
import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'
import { type GenericDataImport } from '/site/content-types'

export function run(): void {
  log.info(`Run Task updateCalculator: ${new Date()}`)
  const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_CALCULATOR_JOB)
  const dataSources: Array<Content<GenericDataImport>> = getAllCalculatorDataset()

  if (dataSources && dataSources.length > 1) {
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: dataSources.map((q) => q._id),
      }
      return node
    })

    const jobLogResult: Array<CreateOrUpdateStatus> = dataSources.map((datasource) => {
      return refreshDataset(datasource, DATASET_BRANCH)
    })

    if (jobLogResult.length === dataSources.length) {
      completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
        result: jobLogResult.map((r) => ({
          id: r.dataquery._id,
          displayName: r.dataquery.displayName,
          contentType: r.dataquery.type,
          dataSourceType: r.dataquery.data.dataSource?._selected,
          status: r.status,
        })),
      })
    }

    const updatedDataquery: number = jobLogResult.filter((job) => job.status === 'GET_DATA_COMPLETE').length

    if (updatedDataquery > 0) {
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
    }
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      result: [],
    })
  }
  cronJobLog(JobNames.REFRESH_DATASET_CALCULATOR_JOB)
}
