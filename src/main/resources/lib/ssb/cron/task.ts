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
  // Calculate number of batches and items per batch
  const totalQueries = httpQueries.length
  const numberOfBatches = Math.min(batchSize, totalQueries)
  const itemsPerBatch = Math.ceil(totalQueries / numberOfBatches)

  const httpQueriesBatches: Array<Array<Content<DataSource>>> = splitEvery(itemsPerBatch, httpQueries)
  const jobLogResult: Array<CreateOrUpdateStatus> = []
  let batchNumber = 0
  let completedBatches = 0
  log.info(
    `Starting refreshQueriesAsync with ${totalQueries} queries split into ${numberOfBatches} batches of approximately ${itemsPerBatch} items each`
  )
  return httpQueriesBatches.map((httpQueriesBatch: Array<Content<DataSource>>) => {
    batchNumber++
    return executeFunction({
      description: `RefreshRows_Batch_${batchNumber}_of_${numberOfBatches}`,
      func: function () {
        progress({
          current: 0,
          total: httpQueriesBatch.length,
          info: `Start batch ${batchNumber}/${numberOfBatches} for datasets ${httpQueriesBatch.map((httpQuery) => httpQuery._id)}`,
        })

        httpQueriesBatch.forEach((httpQuery: Content<DataSource>, httpQueryIndex) => {
          progress({
            current: httpQueryIndex,
            total: httpQueriesBatch.length,
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

          if (httpQueryIndex === httpQueriesBatch.length - 1) {
            // Since this task runs asynchronously, we need to have an additional batch number counter and check to see if all the batches have been completed
            // before logging and updating the job logs. That is to prevent logging and updating the job log multiple times for each batch.
            completedBatches++
            if (completedBatches === numberOfBatches) {
              log.info(`Total progress: ${jobLogResult.length} of ${totalQueries} refreshed`)
              if (jobLogResult.length === totalQueries) {
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
              } else {
                const failedDatasets = httpQueries.filter(
                  (query) => !jobLogResult.some((result) => result.dataquery._id === query._id)
                )
                log.info(
                  `${failedDatasets.length} dataset(s) failed to refresh. Failed dataset id(s): ${failedDatasets.map((ds) => ds._id).join(', ')}. Retrying...`
                )
                const retryResult: CreateOrUpdateStatus[] = failedDatasets.map((dataset) =>
                  refreshDataset(dataset, DATASET_BRANCH)
                )

                jobLogResult.push(...retryResult)

                log.info(`Total progress: ${jobLogResult.length} of ${totalQueries} refreshed`)

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
              progress({
                info: `Total progress: ${jobLogResult.length} of ${totalQueries} refreshed`,
              })
            }
          }
        })
      },
    })
  })
}
