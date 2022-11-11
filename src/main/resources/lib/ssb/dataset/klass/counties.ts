import { SiteConfig } from '../../../../site/site-config'
import { get as getContent, Content } from '/lib/xp/content'
import { DatasetRepoNode } from '../../repo/dataset'
import type { DataSource } from '../../../../site/mixins/dataSource'
const { getSiteConfig } = __non_webpack_require__('/lib/xp/portal')
const { getDataset, extractKey } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { fromDatasetRepoCache } = __non_webpack_require__('/lib/ssb/cache/cache')

/**
 *
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list: () => Array<County> = () => getCountiesFromContent()

function getCountiesFromContent(): Array<County> {
  const siteConfig: SiteConfig = getSiteConfig()
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

export interface CountiesLib {
  list: () => Array<County>
}

export interface County {
  code: string
  parentCode?: string
  level: string
  name: string
  shortName: string
  presentationName: string
}
