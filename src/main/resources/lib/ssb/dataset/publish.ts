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
const {
  getStatistics,
  getDatasetFromStatistics
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

export function publishDataset(): void {
  const statistics: Array<Content<Statistics>> = getStatistics()
  const publishedDatasetIds: Array<string> = []
  statistics.forEach((stat) => {
    const nextRelease: string | null = getNextRelease(stat)
    if (nextRelease) {
      const releaseDate: Date = new Date(nextRelease)
      const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const oneHourFromNow: Date = new Date(now.getTime() + (1000 * 60 * 60))
      if (releaseDate > now && releaseDate < oneHourFromNow) {
        const dataSourceIds: Array<string> = getDatasetFromStatistics(stat)
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
            return false
          }
          if (publishedDatasetIds.indexOf(p.dataset._id) === -1) {
            publishedDatasetIds.push(p.dataset._id)
            return true
          }
          return false
        }) as Array<PublicationItem>
        if (validPublications.length > 0) {
          createTask(stat, releaseDate, validPublications)
        }
      }
    }
  })
}

function createTask(statistic: Content<Statistics>, releaseDate: Date, validPublications: Array<PublicationItem>): void {
  submit({
    description: `Publish statistic (${statistic.data.statistic})`,
    task: () => {
      const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
      const now: Date = new Date(new Date().getTime() + serverOffsetInMs)
      const sleepFor: number = releaseDate.getTime() - now.getTime()
      log.info(`Publish statistic (${statistic.data.statistic}) in ${sleepFor}ms (${releaseDate.toISOString()})`)
      sleep(sleepFor)
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
            deleteDataset(dataSource, UNPUBLISHED_DATASET_BRANCH)
          }
        }
      })
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
