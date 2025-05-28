import { Content } from '/lib/xp/content'
import {
  JobEventNode,
  JobInfoNode,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
} from '/lib/ssb/repo/job'
import { CreateOrUpdateStatus, refreshDataset } from '/lib/ssb/dataset/dataset'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { DataSource } from '/site/mixins'

export function refreshDatasetsForTask(
  jobName: string,
  datasets: Array<Content<DataSource>>,
  clearPartCache?: (jobLogResult?: Array<CreateOrUpdateStatus>) => void
): void {
  cronJobLog(`Start ${jobName} job`)
  const jobLogNode: JobEventNode = startJobLog(jobName)

  if (datasets?.length) {
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: datasets.map((q) => q._id),
      }
      return node
    })

    const jobLogResult: Array<CreateOrUpdateStatus> = datasets.map((ds) =>
      refreshDataset(ds as Content<DataSource>, DATASET_BRANCH)
    )

    if (jobLogResult.length === datasets.length) {
      completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
        result: jobLogResult.map((result) => {
          const { _id, displayName, type, data } = result.dataquery
          return {
            id: _id,
            displayName,
            contentType: type,
            dataSourceType: data?.dataSource?._selected ?? '',
            status: result.status,
          }
        }),
      })
    }

    if (clearPartCache) {
      clearPartCache(jobLogResult)
    }
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, { result: [] })
  }
  cronJobLog(jobName)
}
