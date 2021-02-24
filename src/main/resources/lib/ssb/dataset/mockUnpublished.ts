import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { UNPUBLISHED_DATASET_BRANCH } from '../../repo/dataset'
import { StatisticLib } from '../statistic'
import { DatasetLib } from './dataset'

const {
  query,
  get: getContent
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  getDataSourceIdsFromStatistics
}: StatisticLib = __non_webpack_require__('/lib/ssb/statistic')
const {
  refreshDataset
}: DatasetLib = __non_webpack_require__('/lib/ssb/dataset/dataset')

export function updateUnpublishedMockTbml(): void {
  const res: QueryResponse<Statistics> = query({
    query: `data.statistic = "0"`,
    count: 1
  })
  const stat: Content<Statistics> | null = res.hits[0]
  if (stat) {
    const dataSourceIds: Array<string> = getDataSourceIdsFromStatistics(stat)
    dataSourceIds.forEach((id) => {
      const dataSource: Content<DataSource> | null = getContent({
        key: id
      })
      if (dataSource) {
        refreshDataset(dataSource, UNPUBLISHED_DATASET_BRANCH, undefined)
      }
    })
  }
  return
}

export interface MockUnpublishedLib {
 updateUnpublishedMockTbml: () => void;
}
