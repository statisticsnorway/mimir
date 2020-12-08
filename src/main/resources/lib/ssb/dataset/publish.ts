__non_webpack_require__('/lib/polyfills/nashorn')
import { Content, ContentLibrary } from 'enonic-types/content'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RepoDatasetLib, DatasetRepoNode } from '../../repo/dataset'
import { StatRegStatisticsLib } from '../../repo/statreg/statistics'
import { TaskLib } from '../../types/task'
import { UtilLibrary } from '../../types/util'
import { StatisticLib } from '../statistic'
import { StatisticInListing, VariantInListing } from '../statreg/types'
import { DatasetLib } from './dataset'
import { RepoJobLib, JobEventNode, JobInfoNode, StatisticsPublishResult, DataSourceStatisticsPublishResult } from '../../repo/job'
import { RepoQueryLib } from '../../repo/query'
const {
  Events,
  logUserDataQuery
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  getStatistics,
  getDatasetIdsFromStatistic
}: StatisticLib = __non_webpack_require__('/lib/ssb/statistic')
const {
  get: getContent
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  getStatisticByIdFromRepo
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  data: {
    forceArray
  }
}: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  submit,
  sleep
}: TaskLib = __non_webpack_require__('/lib/xp/task')
const {
  deleteDataset,
  extractKey,
  getDataset
}: DatasetLib = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  createOrUpdateDataset,
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  completeJobLog,
  startJobLog,
  updateJobLog,
  JobNames,
  JobStatus
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')

const jobs: {[key: string]: JobEventNode | JobInfoNode} = {}

export function publishDataset(): void {
  log.info('Start publish job')
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUBLISH_JOB)
  jobs[jobLogNode._id] = jobLogNode
  const statistics: Array<Content<Statistics>> = getStatistics()
  const publishedDatasetIds: Array<string> = []
  const jobResult: Array<StatisticsPublishResult> = []
  statistics.forEach((stat) => {
    const nextRelease: string | null = getNextRelease(stat)
    if (nextRelease) {
      const releaseDate: Date = new Date(nextRelease)
      const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const oneHourFromNow: Date = new Date(now.getTime() + (1000 * 60 * 60))
      if (releaseDate > now && releaseDate < oneHourFromNow) {
        log.info(`Stat ${stat.data.statistic} releases today`)
        const statJobInfo: StatisticsPublishResult = {
          statistic: stat._id,
          shortNameId: stat.data.statistic ? stat.data.statistic : '',
          status: JobStatus.STARTED,
          dataSources: []
        }
        const dataSourceIds: Array<string> = getDatasetIdsFromStatistic(stat)
        const dataSources: Array<Content<DataSource> | null> = dataSourceIds.map((key) => {
          return getContent({
            key
          })
        })
        const publications: Array<PublicationItem | null> = dataSources.map((dataSource): PublicationItem | null => {
          if (dataSource) {
            return {
              dataset: getDataset(dataSource, UNPUBLISHED_DATASET_BRANCH),
              dataSource
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
              message: 'No unpublished dataset to publish'
            })
            return false
          }
          if (!publishedDatasetIds.includes(p.dataset._id)) {
            publishedDatasetIds.push(p.dataset._id)
            statJobInfo.dataSources.push({
              id: p.dataSource._id,
              status: JobStatus.STARTED,
              message: ''
            })
            return true
          }
          return false
        }) as Array<PublicationItem>
        if (validPublications.length > 0) {
          createTask(jobLogNode._id, stat, releaseDate, validPublications)
        } else {
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
      refreshDataResult: jobResult
    }
    return node
  })
  log.info('End publish job')
}

function createTask(jobId: string, statistic: Content<Statistics>, releaseDate: Date, validPublications: Array<PublicationItem>): void {
  submit({
    description: `Publish statistic (${statistic.data.statistic})`,
    task: () => {
      const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const sleepFor: number = releaseDate.getTime() - now.getTime()
      log.info(`Publish statistic (${statistic.data.statistic}) in ${sleepFor}ms (${releaseDate.toISOString()})`)
      sleep(sleepFor)
      const job: JobInfoNode = jobs[jobId] as JobInfoNode
      const jobRefreshResult: Array<StatisticsPublishResult> = forceArray(job.data.refreshDataResult) as Array<StatisticsPublishResult>
      const statRefreshResult: StatisticsPublishResult | undefined = jobRefreshResult.find((s) => {
        return s.statistic === statistic._id
      })
      validPublications.forEach((publication) => {
        const {
          dataSource,
          dataset
        } = publication
        if (dataset && dataSource.data.dataSource) {
          const key: string | null = extractKey(dataSource)
          if (key) {
            log.info(`publishing dataset ${dataSource.data.dataSource?._selected} - ${key} for ${statistic.data.statistic}`)
            createOrUpdateDataset(dataSource.data.dataSource?._selected, DATASET_BRANCH, key, dataset.data)
            logUserDataQuery(dataSource._id, {
              file: '/lib/ssb/dataset/publish.ts',
              function: 'createTask',
              message: Events.DATASET_PUBLISHED
            })
            deleteDataset(dataSource, UNPUBLISHED_DATASET_BRANCH)
            if (statRefreshResult) {
              const dataSourceRefreshResult: DataSourceStatisticsPublishResult | undefined = forceArray(statRefreshResult.dataSources).find((ds) => {
                return ds.id === dataSource._id
              })
              if (dataSourceRefreshResult) {
                dataSourceRefreshResult.status = JobStatus.COMPLETE
              }
            }
          }
        }
      })
      if (job && statRefreshResult) {
        statRefreshResult.status = JobStatus.COMPLETE
        const allComplete: boolean = jobRefreshResult.filter((s) => {
          return s.status === JobStatus.COMPLETE || s.status === JobStatus.ERROR
        }).length === jobRefreshResult.length
        if (allComplete) {
          completeJobLog(jobId, `Successfully updated ${jobRefreshResult.length} statistics`, jobRefreshResult)
        } else {
          updateJobLog(jobId, (node: JobInfoNode) => {
            node.data = {
              ...node.data,
              refreshDataResult: jobRefreshResult
            }
            return node
          })
        }
      }
    }
  })
}

function getNextRelease(statistic: Content<Statistics>): string | null{
  if (statistic.data.statistic) {
    const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
    if (statisticStatreg) {
      const variants: Array<VariantInListing> = forceArray(statisticStatreg.variants)
      const variant: VariantInListing = variants[0] // TODO: Multiple variants
      return variant.nextRelease ? variant.nextRelease : null
    }
  }
  return null
}

export interface PublishDatasetLib {
    publishDataset: () => void;
}

interface PublicationItem {
  dataset: DatasetRepoNode<object> | null;
  dataSource: Content<DataSource>;
}
