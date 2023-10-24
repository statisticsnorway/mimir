import { Content } from '/lib/xp/content'
import { progress, executeFunction } from '/lib/xp/task'
import { RSSFilterLogData } from '/lib/ssb/cron/rss'
import { splitEvery } from '/lib/vendor/ramda'

import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { CreateOrUpdateStatus, refreshDataset } from '/lib/ssb/dataset/dataset'
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { completeJobLog, JOB_STATUS_COMPLETE } from '/lib/ssb/repo/job'
import { type DataSource } from '/site/mixins/dataSource'

export function refreshQueriesAsync(
  httpQueries: Array<Content<DataSource>>,
  jobLogId: string,
  filterInfo: RSSFilterLogData,
  batchSize = 4
): Array<string> {
  const httpQueriesBatches: Array<Array<Content<DataSource>>> = splitEvery(httpQueries.length / batchSize, httpQueries)
  const jobLogResult: Array<CreateOrUpdateStatus> = []
  let a = 0
  return httpQueriesBatches.map((httpQueriesbatch: Array<Content<DataSource>>) => {
    a++
    return executeFunction({
      description: `RefreshRows_${a}`,
      func: function () {
        progress({
          current: 0,
          total: httpQueriesbatch.length,
          info: `Start task for datasets ${httpQueriesbatch.map((httpQuery) => httpQuery._id)}`,
        })
        httpQueriesbatch.forEach((httpQuery: Content<DataSource>, index) => {
          progress({
            current: index,
            total: httpQueriesbatch.length,
            info: `Refresh dataset ${httpQuery._id}`,
          })
          logUserDataQuery(httpQuery._id, {
            message: Events.GET_DATA_STARTED,
          })
          const result: CreateOrUpdateStatus = refreshDataset(httpQuery, DATASET_BRANCH)
          logUserDataQuery(httpQuery._id, {
            message: result.status,
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
                status: r.status,
              })),
            })
          }
        })
      },
    })
  })
}
