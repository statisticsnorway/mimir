import { get as getContent, Content } from '/lib/xp/content'
import type { Statistics } from '/site/content-types'
import type { DataSource } from '/site/mixins/dataSource'
import {
  JobEventNode,
  JobInfoNode,
  StatisticsPublishResult,
  DataSourceStatisticsPublishResult,
} from '/lib/ssb/repo/job'
import type { Statistic } from '/site/mixins/statistic'
import { PublicationItem } from '/lib/ssb/dataset/publish'
import type { PublishDataset as PublishDatasetConfig } from 'src/main/resources/tasks/publishDataset'
import { ReleaseDatesVariant, StatisticInListing } from '/lib/ssb/dashboard/statreg/types'

const { create: createScheduledJob } = __non_webpack_require__('/lib/xp/scheduler')
const { getDataSourceIdsFromStatistics, getStatisticsContent } = __non_webpack_require__('/lib/ssb/dashboard/statistic')
const { getDataset } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { UNPUBLISHED_DATASET_BRANCH } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { getReleaseDatesByVariants, getStatisticByIdFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { completeJobLog, startJobLog, updateJobLog, JobNames, JobStatus } = __non_webpack_require__('/lib/ssb/repo/job')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

exports.run = function (): void {
  cronJobLog('Start publish job')
  log.info('PublishJob - Start publish job')
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUBLISH_JOB)
  const statistics: Array<Content<Statistics & Statistic>> = getStatisticsContent()
  const publishedDatasetIds: Array<string> = []
  const jobResult: Array<StatisticsPublishResult> = []
  let statisticIndex = 0

  statistics.forEach((stat) => {
    const nextRelease: string | null = getNextRelease(stat)
    if (nextRelease) {
      const releaseDate: Date = new Date(nextRelease)
      const serverOffsetInMs: number =
        app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const oneHourFromNow: Date = new Date(now.getTime() + 1000 * 60 * 60)
      if (releaseDate > now && releaseDate < oneHourFromNow) {
        log.info(
          `PublishJob - Statistic with Id ${stat.data.statistic}(${stat.language}) have releases today between ${now} - ${oneHourFromNow}`
        )
        const statJobInfo: StatisticsPublishResult = {
          statistic: stat._id,
          shortNameId: stat.data.statistic ? stat.data.statistic : '',
          status: JobStatus.STARTED,
          dataSources: [],
        }
        const dataSourceIds: Array<string> = getDataSourceIdsFromStatistics(stat)
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
          // To avoid updating jobLog at the same time statisticIndex will create diffirence time for task cleanupPublishDataset
          statisticIndex = stat.language === 'en' ? statisticIndex + 2 : statisticIndex + 1
          validPublications.forEach((validPublication, index: number) => {
            const runTaskTime: string = new Date(releaseDate.getTime() - serverOffsetInMs - 1000).toISOString()
            const datasetIndex: number = statisticIndex + index
            log.info(
              `PublishJob - create task: publishDataset_${stat.data.statistic}_${validPublication.dataset?._name} Time: ${runTaskTime}`
            )
            createScheduledJob<PublishDatasetConfig>({
              name: `publishDataset_${jobLogNode._id}_${stat.data.statistic}_${validPublication.dataset?._name}`,
              descriptor: 'mimir:publishDataset',
              enabled: true,
              schedule: {
                type: 'ONE_TIME',
                value: runTaskTime,
              },
              config: {
                jobId: jobLogNode._id,
                statisticsContentId: stat._id,
                statisticsId: stat.data.statistic || '',
                publicationItem: JSON.stringify(validPublication),
                datasetIndex: datasetIndex.toString(),
              },
            })
          })
        } else {
          statJobInfo.status = JobStatus.SKIPPED
          log.info(`PublishJob - No unpublished dataset to publish for ${stat.data.statistic}`)
        }
        jobResult.push(statJobInfo)
      }
    }
  })
  updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
    node.data = {
      ...node.data,
      queryIds: jobResult.map((q) => q.statistic),
      refreshDataResult: jobResult,
    }
    return node
  })
  if (jobResult.length === 0 || allJobsAreSkipped(jobResult)) {
    completeJobLog(jobLogNode._id, `Successfully updated 0 statistics`, [])
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

export function getNextRelease(statistic: Content<Statistics & Statistic>): string | null {
  if (statistic.data.statistic) {
    const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
    if (statisticStatreg && statisticStatreg.variants) {
      const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(forceArray(statisticStatreg.variants))
      return releaseDates.nextRelease[0]
    }
  }
  return null
}
