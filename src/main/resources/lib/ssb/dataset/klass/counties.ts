import { get as getContent, Content } from '/lib/xp/content'

import { getSiteConfig } from '/lib/xp/portal'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { getDataset, extractKey } from '/lib/ssb/dataset/dataset'
import { fromDatasetRepoCache } from '/lib/ssb/cache/cache'
import { type DataSource } from '/site/mixins/dataSource'

/**
 *
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list: () => Array<County> = () => getCountiesFromContent()

function getCountiesFromContent(): Array<County> {
  const siteConfig: XP.SiteConfig | null = getSiteConfig()
  if (!siteConfig) return []

  const key: string | undefined = siteConfig.countyDataContentId
  if (key) {
    const dataSource: Content<DataSource> | null = getContent({
      key,
    })
    if (dataSource) {
      const dataset: DatasetRepoNode<object> | undefined = fromDatasetRepoCache(
        `${dataSource.data.dataSource?._selected}/${extractKey(dataSource)}`,
        () => {
          return getDataset(dataSource)
        }
      )
      if (dataset && dataset.data) {
        const data: { codes: Array<County> } = dataset.data as { codes: Array<County> }
        return data.codes
      }
    }
  }
  return []
}

export interface County {
  code: string
  parentCode?: string
  level: string
  name: string
  shortName: string
  presentationName: string
}
