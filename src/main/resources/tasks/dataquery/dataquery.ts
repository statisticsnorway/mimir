import { cronJobLog } from '/lib/ssb/utils/serverLog'
import {
  type JobEventNode,
  type JobInfoNode,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames,
} from '/lib/ssb/repo/job'
import { type RSSFilter, dataSourceRSSFilter } from '/lib/ssb/cron/rss'
import { getContentWithDataSource } from '/lib/ssb/dataset/dataset'
import { refreshQueriesAsync } from '/lib/ssb/cron/task'
import { Content } from '@enonic-types/lib-content'
import { DataSource } from '/site/mixins/dataSource'

export function run(): void {
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
