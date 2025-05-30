import '/lib/ssb/polyfills/nashorn'
import { get as getContent, Content } from '/lib/xp/content'
import { NodeQueryResultHit } from '/lib/xp/node'
import { send } from '/lib/xp/event'
import { executeFunction, sleep } from '/lib/xp/task'
import { run, type ContextParams } from '/lib/xp/context'
import { isSameOrBefore } from '/lib/ssb/utils/dateUtils'
import { isSameDay } from '/lib/vendor/dateFns'

import { Events, logUserDataQuery } from '/lib/ssb/repo/query'
import { getDataSourceIdsFromStatistics, getStatisticsContent } from '/lib/ssb/dashboard/statistic'
import { getStatisticByIdFromRepo, getReleaseDatesByVariants } from '/lib/ssb/statreg/statistics'
import * as util from '/lib/util'
import {
  JobEventNode,
  JobInfoNode,
  StatisticsPublishResult,
  DataSourceStatisticsPublishResult,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JobNames,
  JobStatus,
  queryJobLogs,
  getJobLog,
} from '/lib/ssb/repo/job'
import { StatisticInListing, ReleaseDatesVariant } from '/lib/ssb/dashboard/statreg/types'
import {
  DatasetRepoNode,
  createOrUpdateDataset,
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH,
} from '/lib/ssb/repo/dataset'
import { deleteDataset, extractKey, getDataset } from '/lib/ssb/dataset/dataset'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { type Statistic } from '/site/mixins/statistic'
import { type DataSource } from '/site/mixins/dataSource'
import { type Statistics } from '/site/content-types'

const jobs: { [key: string]: JobEventNode | JobInfoNode } = {}

export function currentlyWaitingForPublish(statistic: Content<Statistics>): boolean {
  const from: string = new Date(Date.now() - 1800000).toISOString()
  const to: string = new Date().toISOString()
  const jobRes: NodeQueryResultHit | null = queryJobLogs({
    start: 0,
    count: 1,
    query: `
      _path LIKE "/jobs/*" AND
      data.task = "${JobNames.PUBLISH_JOB}" AND
      data.status = "${JobStatus.STARTED}" AND
      range("_ts", instant("${from}"), instant("${to}"))`,
    sort: '_ts DESC',
  }).hits[0]
  if (jobRes) {
    const job: JobInfoNode | null = getJobLog(jobRes.id) as JobInfoNode | null
    if (job) {
      const jobRefreshResult: Array<StatisticsPublishResult> = util.data.forceArray(
        job.data.refreshDataResult
      ) as Array<StatisticsPublishResult>
      const statRefreshResult: StatisticsPublishResult | undefined = jobRefreshResult.find((s) => {
        return s && s.statistic === statistic._id
      })
      if (
        statRefreshResult &&
        statRefreshResult.status !== JobStatus.COMPLETE &&
        statRefreshResult.status !== JobStatus.SKIPPED
      ) {
        const nextRelease: string | null = getNextRelease(statistic)
        const previousRelease: string | null = getPreviousRelease(statistic)
        const serverOffsetInMs: number =
          app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
        const now: Date = new Date(new Date().getTime() + serverOffsetInMs + 1000)
        const nextReleaseSameOrBeforeNow: boolean = nextRelease ? isSameOrBefore(new Date(nextRelease), now) : false
        const previousReleaseSameDayNow: boolean = previousRelease ? isSameDay(new Date(previousRelease), now) : false
        const previousReleaseSameOrBeforeNow: boolean = previousRelease
          ? isSameOrBefore(new Date(previousRelease), now)
          : false
        const nextReleaseReleaseSameDayNow: boolean = nextRelease ? isSameDay(new Date(nextRelease), now) : false
        if (
          nextReleaseSameOrBeforeNow ||
          (previousReleaseSameDayNow && !nextReleaseReleaseSameDayNow && previousReleaseSameOrBeforeNow)
        ) {
          return true
        }
      }
    }
  }
  return false
}

export function publishDataset(): void {
  cronJobLog('Start publish job')
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUBLISH_JOB)
  jobs[jobLogNode._id] = jobLogNode
  const statistics: Array<Content<Statistics & Statistic>> = getStatisticsContent()
  const publishedDatasetIds: Array<string> = []
  const jobResult: Array<StatisticsPublishResult> = []
  statistics.forEach((stat) => {
    const nextRelease: string | null = getNextRelease(stat)
    if (nextRelease) {
      const releaseDate: Date = new Date(nextRelease)
      const serverOffsetInMs: number =
        app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const oneHourFromNow: Date = new Date(now.getTime() + 1000 * 60 * 60)
      if (releaseDate > now && releaseDate < oneHourFromNow) {
        log.info(`Stat ${stat.data.statistic} releases today`)
        const statJobInfo: StatisticsPublishResult = {
          statistic: stat._id,
          shortNameId: stat.data.statistic ? stat.data.statistic : '',
          status: JobStatus.STARTED,
          dataSources: [],
        }
        const draftContext: ContextParams = {
          branch: 'draft',
        }
        const statisticDraft: Content<Statistics> | null = run(draftContext, () => {
          return getContent({ key: stat._id })
        })
        const dataSourceIdsMaster: Array<string> = getDataSourceIdsFromStatistics(stat)
        const dataSourceIdsDraft: Array<string> = statisticDraft ? getDataSourceIdsFromStatistics(statisticDraft) : []
        const uniqueDatasourceDraft: Array<string> = dataSourceIdsDraft.filter(
          (item) => !dataSourceIdsMaster.includes(item)
        )
        const dataSourceIds: Array<string> = dataSourceIdsMaster.concat(uniqueDatasourceDraft)
        const dataSources: Array<Content<DataSource> | null> = dataSourceIds.map((key) => {
          return getContent({
            key,
          })
        })
        const publications: Array<PublicationItem | null> = dataSources.map((dataSource): PublicationItem | null => {
          if (dataSource) {
            return {
              dataset: getDataset(dataSource, UNPUBLISHED_DATASET_BRANCH),
              dataSource,
            }
          }
          return null
        })

        // filter out missing datasets and datasets already covered by other stats
        const validPublications: Array<PublicationItem> = publications.filter((p) => {
          if (!p) {
            return false
          }
          if (!p.dataset) {
            statJobInfo.dataSources.push({
              id: p.dataSource._id,
              status: JobStatus.SKIPPED,
              message: 'No unpublished dataset to publish',
            })
            return false
          }
          if (!publishedDatasetIds.includes(p.dataset._id)) {
            publishedDatasetIds.push(p.dataset._id)
            statJobInfo.dataSources.push({
              id: p.dataSource._id,
              status: JobStatus.STARTED,
              message: '',
            })
            return true
          }
          return false
        }) as Array<PublicationItem>
        if (validPublications.length > 0) {
          validPublications.forEach((validPublication) => {
            createTask(jobLogNode._id, stat, releaseDate, validPublication)
          })
        } else {
          statJobInfo.status = JobStatus.SKIPPED
          log.info(`No unpublished dataset to publish for ${stat.data.statistic}`)
        }
        jobResult.push(statJobInfo)
      }
    }
  })
  jobs[jobLogNode._id] = updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: jobResult.map((q) => q.statistic),
      refreshDataResult: jobResult,
    }
    return node
  })
  if (jobResult.length === 0 || allJobsAreSkipped(jobResult)) {
    completeJobLog(jobLogNode._id, `Successfully updated 0 statistics`, [])
    delete jobs[jobLogNode._id]
  }
}

function allJobsAreSkipped(jobResult: Array<StatisticsPublishResult>): boolean {
  const sum: Array<boolean> = jobResult.reduce((acc: Array<boolean>, jr: StatisticsPublishResult): Array<boolean> => {
    const numberOfSkippedDataSources: number = jr.dataSources.filter((ds: DataSourceStatisticsPublishResult) => {
      return ds.status === JobStatus.SKIPPED
    }).length
    acc.push(jr.dataSources.length === numberOfSkippedDataSources)
    return acc
  }, [])
  return !sum.includes(false)
}

function createTask(
  jobId: string,
  statistic: Content<Statistics & Statistic>,
  releaseDate: Date,
  publication: PublicationItem
): void {
  executeFunction({
    description: `Publish statistic (${statistic.data.statistic})`,
    func: () => {
      /*
       * Iterate this statistics related datasources, and check if they have unpublished data
       * If they do, create or update the dataset on master branch
       * Then delete dataset in draft
       * */
      const { dataSource, dataset } = publication
      if (dataset && dataSource.data.dataSource) {
        let ts: number = Date.now()
        const start: number = Date.now()
        const timings: PublishTimings = {
          preSleepPrep: null,
          postSleepPrep: null,
          publish: null,
          log: null,
          sendClearCache: null,
          delete: null,
          completeJob: null,
          total: null,
        }
        const key: string | null = extractKey(dataSource)
        const serverOffsetInMs: number =
          app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
        const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
        const sleepFor: number = releaseDate.getTime() - now.getTime()

        log.info(
          `Publish dataset (${key}) for statistic ${
            statistic.data.statistic
          } in ${sleepFor}ms (${releaseDate.toISOString()})`
        )
        timings.preSleepPrep = Date.now() - ts

        sleep(sleepFor)

        ts = Date.now()

        const job: JobInfoNode = jobs[jobId] as JobInfoNode
        const jobRefreshResult: Array<StatisticsPublishResult> = util.data.forceArray(
          job.data.refreshDataResult
        ) as Array<StatisticsPublishResult>
        const statRefreshResult: StatisticsPublishResult | undefined = jobRefreshResult.find((s) => {
          return s.statistic === statistic._id
        })

        timings.postSleepPrep = Date.now() - ts
        ts = Date.now()

        if (key) {
          log.info(
            `publishing dataset ${dataSource.data.dataSource?._selected} - ${key} for ${statistic.data.statistic}`
          )
          createOrUpdateDataset(dataSource.data.dataSource?._selected, DATASET_BRANCH, key, dataset.data)
          log.info(
            `finished publish of dataset ${dataSource.data.dataSource?._selected} - ${key} for ${statistic.data.statistic}`
          )

          timings.publish = Date.now() - ts
          ts = Date.now()

          logUserDataQuery(dataSource._id, {
            file: '/lib/ssb/dataset/publish.ts',
            function: 'createTask',
            message: Events.DATASET_PUBLISHED,
          })

          timings.log = Date.now() - ts
          ts = Date.now()

          send({
            type: 'clearDatasetCache',
            distributed: true,
            data: {
              path: dataset._path,
            },
          })

          timings.sendClearCache = Date.now() - ts
          ts = Date.now()

          deleteDataset(dataSource, UNPUBLISHED_DATASET_BRANCH)

          timings.delete = Date.now() - ts
          ts = Date.now()

          if (statRefreshResult) {
            const dataSourceRefreshResult: DataSourceStatisticsPublishResult | undefined = util.data
              .forceArray(statRefreshResult.dataSources)
              .find((ds) => {
                return ds.id === dataSource._id
              })
            if (dataSourceRefreshResult) {
              dataSourceRefreshResult.status = JobStatus.COMPLETE
            }
          }
        }
        // Update the statistics refresh result object
        if (job && statRefreshResult) {
          const allDataSourcesComplete: boolean =
            util.data.forceArray(statRefreshResult.dataSources).filter((ds) => {
              return (
                ds.status === JobStatus.COMPLETE || ds.status === JobStatus.ERROR || ds.status === JobStatus.SKIPPED
              )
            }).length === util.data.forceArray(statRefreshResult.dataSources).length
          if (allDataSourcesComplete) {
            log.info(`finished publishing statistic ${statistic.data.statistic}`)
            statRefreshResult.status = JobStatus.COMPLETE
            const allComplete: boolean =
              jobRefreshResult.filter((s) => {
                return s.status === JobStatus.COMPLETE || s.status === JobStatus.ERROR || s.status === JobStatus.SKIPPED
              }).length === jobRefreshResult.length
            if (allComplete) {
              log.info('finished publish job')
              sleep(100)
              completeJobLog(jobId, `Successfully updated ${jobRefreshResult.length} statistics`, jobRefreshResult)
              log.info('complete status set for publish job')
              delete jobs[jobId]
              send({
                type: 'clearCache',
                distributed: true,
                data: {
                  clearDatasetRepoCache: true,
                },
              })
            } else {
              updateJobLog(jobId, (node: JobInfoNode) => {
                node.data = {
                  ...node.data,
                  refreshDataResult: jobRefreshResult,
                }
                return node
              })
            }
          }
        }

        timings.completeJob = Date.now() - ts
        timings.total = Date.now() - start - sleepFor
        log.info(`PUBLISH TIMING :: ${key} :: ${JSON.stringify(timings, null, 2)}`)
      }
    },
  })
}

function getNextRelease(statistic: Content<Statistics & Statistic>): string | null {
  if (statistic.data.statistic) {
    const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
    if (statisticStatreg && statisticStatreg.variants) {
      const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(
        util.data.forceArray(statisticStatreg.variants)
      )
      return releaseDates.nextRelease[0]
    }
  }
  return null
}

function getPreviousRelease(statistic: Content<Statistics & Statistic>): string | null {
  if (statistic.data.statistic) {
    const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
    if (statisticStatreg && statisticStatreg.variants) {
      const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(
        util.data.forceArray(statisticStatreg.variants)
      )
      return releaseDates.previousRelease[0]
    }
  }
  return null
}

export interface PublishDatasetLib {
  publishDataset: () => void
  currentlyWaitingForPublish: (statistic: Content<Statistic>) => boolean
}

interface PublicationItem {
  dataset: DatasetRepoNode<object> | null
  dataSource: Content<DataSource>
}

interface PublishTimings {
  preSleepPrep: null | number
  postSleepPrep: null | number
  publish: null | number
  log: null | number
  sendClearCache: null | number
  delete: null | number
  completeJob: null | number
  total: null | number
}
