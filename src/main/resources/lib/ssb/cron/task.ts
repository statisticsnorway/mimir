import { Content } from '/lib/xp/content'
import { CreateOrUpdateStatus } from '../dataset/dataset'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RSSFilterLogData } from './rss'

const {
  splitEvery
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  refreshDataset
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  progress,
  executeFunction
} = __non_webpack_require__('/lib/xp/task')
const {
  logUserDataQuery,
  Events
} = __non_webpack_require__('/lib/ssb/repo/query')
const {
  completeJobLog,
  JOB_STATUS_COMPLETE
} = __non_webpack_require__('/lib/ssb/repo/job')

export function refreshQueriesAsync(
  httpQueries: Array<Content<DataSource>>,
  jobLogId: string,
  filterInfo: RSSFilterLogData,
  batchSize: number = 4
): Array<string> {
  const httpQueriesBatches: Array<Array<Content<DataSource>>> = splitEvery((httpQueries.length / batchSize), httpQueries)
  const jobLogResult: Array<CreateOrUpdateStatus> = []
  let a: number = 0
  return httpQueriesBatches.map((httpQueriesbatch: Array<Content<DataSource>>) => {
    a++
    return executeFunction({
      description: `RefreshRows_${a}`,
      func: function() {
        progress({
          current: 0,
          total: httpQueriesbatch.length,
          info: `Start task for datasets ${httpQueriesbatch.map((httpQuery) => httpQuery._id)}`
        })
        httpQueriesbatch.map((httpQuery: Content<DataSource>, index) => {
          progress({
            current: index,
            total: httpQueriesbatch.length,
            info: `Refresh dataset ${httpQuery._id}`
          })
          logUserDataQuery(httpQuery._id, {
            message: Events.GET_DATA_STARTED
          })
          const result: CreateOrUpdateStatus = refreshDataset(httpQuery, DATASET_BRANCH)
          logUserDataQuery(httpQuery._id, {
            message: result.status
          })
          jobLogResult.push(result)
          if (jobLogResult.length === httpQueries.length) {
            completeJobLog(jobLogId, JOB_STATUS_COMPLETE, {
              filterInfo,
              result: jobLogResult.map((r) => ({
                id: r.dataquery._id,
                displayName: r.dataquery.displayName,
                contentType: r.dataquery.type,
                dataSourceType: r.dataquery.data.dataSource?._selected,
                status: r.status
              }))
            })
          }
        })
      }
    })
  })
}

export interface SSBTaskLib {
  refreshQueriesAsync: (httpQueries: Array<Content<DataSource>>, jobLogId: string, filterInfo: RSSFilterLogData, batchSize?: number) => Array<string>;
}
