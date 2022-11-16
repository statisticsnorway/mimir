import { JobEventNode, JobInfoNode } from '../../lib/ssb/repo/job'
import { CreateOrUpdateStatus } from '../../lib/ssb/dataset/dataset'
import { GenericDataImport } from '../../site/content-types/genericDataImport/genericDataImport'
import { Content } from '/lib/xp/content'
import { DATASET_BRANCH } from '../../lib/ssb/repo/dataset'

const { completeJobLog, startJobLog, updateJobLog, JOB_STATUS_COMPLETE, JobNames } =
  __non_webpack_require__('/lib/ssb/repo/job')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const { refreshDataset } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { getAllCalculatorDataset } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const { clearPartFromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

exports.run = function (): void {
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
