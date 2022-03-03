import { Content, QueryResponse } from '/lib/xp/content'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { UNPUBLISHED_DATASET_BRANCH } from '../repo/dataset'

const {
  query,
  get: getContent
} = __non_webpack_require__('/lib/xp/content')
const {
  getDataSourceIdsFromStatistics
} = __non_webpack_require__('/lib/ssb/dashboard/statistic')
const {
  refreshDataset
} = __non_webpack_require__('/lib/ssb/dataset/dataset')

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
