import { query, get as getContent, Content, ContentsResult } from '/lib/xp/content'
import { UNPUBLISHED_DATASET_BRANCH } from '/lib/ssb/repo/dataset'

import { getDataSourceIdsFromStatistics } from '/lib/ssb/dashboard/statistic'
import { refreshDataset } from '/lib/ssb/dataset/dataset'
import { type DataSource } from '/site/mixins/dataSource'
import { type Statistics } from '/site/content-types'

export function updateUnpublishedMockTbml(): void {
  const res: ContentsResult<Content<Statistics>> = query({
    query: `data.statistic = "0"`,
    count: 1,
  })
  const stat: Content<Statistics> | null = res.hits[0]
  if (stat) {
    const dataSourceIds: Array<string> = getDataSourceIdsFromStatistics(stat)
    dataSourceIds.forEach((id) => {
      const dataSource: Content<DataSource> | null = getContent({
        key: id,
      })
      if (dataSource) {
        refreshDataset(dataSource, UNPUBLISHED_DATASET_BRANCH, undefined)
      }
    })
  }
  return
}
