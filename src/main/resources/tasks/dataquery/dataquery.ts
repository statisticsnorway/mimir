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
import {libScheduleTestLog} from '/lib/ssb/cron/cron'


const dataqueryCron: string =
    app.config && app.config['ssb.cron.dataquery'] ? app.config['ssb.cron.dataquery'] : '0 15 * * *'

export function run(): void {
  libScheduleTestLog('dataqueryCronTest', dataqueryCron)

    cronJobLog(JobNames.REFRESH_DATASET_JOB)
    const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_JOB)
  
    const filterData: RSSFilter = dataSourceRSSFilter(getContentWithDataSource())
    const dataSourceQueries: Array<Content<DataSource>> = filterData.filteredDataSources
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: dataSourceQueries.map((q: { _id: any }) => q._id),
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