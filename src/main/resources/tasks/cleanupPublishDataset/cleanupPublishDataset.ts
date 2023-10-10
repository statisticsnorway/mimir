import { send } from '/lib/xp/event'
import {
  DataSourceStatisticsPublishResult,
  JobInfoNode,
  JOB_STATUS_COMPLETE,
  StatisticsPublishResult,
  updateJobLog,
  JobStatus,
  getJobLog,
} from '/lib/ssb/repo/job'
import { type CleanupPublishDataset as CleanupPublishDatasetConfig } from '/tasks/cleanupPublishDataset'
__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import { Events, logUserDataQuery } from '/lib/ssb/repo/query'
import * as util from '/lib/util'
import { deleteDataset, extractKey } from '/lib/ssb/dataset/dataset'
import { UNPUBLISHED_DATASET_BRANCH } from '/lib/ssb/repo/dataset'

export function run(props: CleanupPublishDatasetConfig): void {
  const { jobId, statisticsContentId, publicationItem, statisticsId } = props
  const { dataSource, dataset } = JSON.parse(publicationItem)

  /*
   * Iterate this statistics related datasources, and check if they have unpublished data
   * If they do, create or update the dataset on master branch
   * Then delete dataset in draft
   * */
  if (dataset && dataSource.data.dataSource) {
    const key: string | null = extractKey(dataSource)

    const job: JobInfoNode = getJobLog(jobId) as JobInfoNode
    const jobRefreshResult: Array<StatisticsPublishResult> = util.data.forceArray(
      job.data.refreshDataResult
    ) as Array<StatisticsPublishResult>
    const statRefreshResult: StatisticsPublishResult | undefined = jobRefreshResult.find((s) => {
      return s.statistic === statisticsContentId
    })

    if (key) {
      logUserDataQuery(dataSource._id, {
        file: '/lib/ssb/dataset/publish.ts',
        function: 'createTask',
        message: Events.DATASET_PUBLISHED,
      })
      deleteDataset(dataSource, UNPUBLISHED_DATASET_BRANCH)
    }
    // Update the statistics refresh result object
    if (job && statRefreshResult) {
      updateLogs(jobId, statisticsContentId, statisticsId, dataSource._id)
    }
  }
}

function updateLogs(jobId: string, statisticsContentId: string, statisticsId: string, dataSourceId: string): void {
  let completed = false

  updateJobLog(jobId, (node: JobInfoNode) => {
    const refreshDataResult: Array<StatisticsPublishResult> = util.data.forceArray(
      node.data.refreshDataResult
    ) as Array<StatisticsPublishResult>
    const statRefreshResult: StatisticsPublishResult | undefined = refreshDataResult.find((s) => {
      return s.statistic === statisticsContentId
    })
    if (statRefreshResult) {
      const dataSourceRefreshResult: DataSourceStatisticsPublishResult | undefined = util.data
        .forceArray(statRefreshResult.dataSources)
        .find((ds) => {
          return ds.id === dataSourceId
        })
      if (dataSourceRefreshResult) {
        dataSourceRefreshResult.status = JobStatus.COMPLETE
        // log.info(`Update jobLog ${jobId} - Datasource: ${dataSourceId} Statistikk: ${statisticsId}(content: ${statisticsContentId})  - COMPLETE`)
      }
      const allDataSourcesComplete: boolean =
        util.data.forceArray(statRefreshResult.dataSources).filter((ds) => {
          return ds.status === JobStatus.COMPLETE || ds.status === JobStatus.ERROR || ds.status === JobStatus.SKIPPED
        }).length === util.data.forceArray(statRefreshResult.dataSources).length
      if (allDataSourcesComplete) {
        statRefreshResult.status = JobStatus.COMPLETE
        // log.info(`Update jobLog ${jobId} - All Datasources statistikk: ${statisticsId}(content: ${statisticsContentId})  - COMPLETE`)
      }
      const allStatisticsComplete: boolean =
        refreshDataResult.filter((stat) => {
          return (
            stat.status === JobStatus.COMPLETE || stat.status === JobStatus.ERROR || stat.status === JobStatus.SKIPPED
          )
        }).length === refreshDataResult.length
      if (allStatisticsComplete) {
        completed = true
        node.data.message = `Successfully updated ${refreshDataResult.length} statistics`
        node.data.status = JOB_STATUS_COMPLETE
        node.data.completionTime = new Date().toISOString()
        log.info(`Update jobLog ${jobId} - All statistics - COMPLETE`)
      }
    }
    return node
  })
  if (completed) {
    log.info('All dataset completed -  clearCache')
    send({
      type: 'clearCache',
      distributed: true,
      data: {
        clearDatasetRepoCache: true,
      },
    })
  }
}
