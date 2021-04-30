import { PortalLibrary } from 'enonic-types/portal'
import { SiteConfig } from '../../../../site/site-config'
import { Content, ContentLibrary } from 'enonic-types/content'
import { DatasetRepoNode } from '../../repo/dataset'
import { DatasetLib } from '../dataset'
import { SSBCacheLibrary } from '../../cache/cache'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'
const {
  getSiteConfig
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  get: getContent
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getDataset,
  extractKey
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  fromDatasetRepoCache
}: SSBCacheLibrary = __non_webpack_require__( '/lib/ssb/cache')

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
      key
    })
    if (dataSource) {
      const dataset: DatasetRepoNode<object> | undefined = fromDatasetRepoCache(`${dataSource.data.dataSource?._selected}/${extractKey(dataSource)}`, () => {
        return getDataset(dataSource)
      })
      if (dataset && dataset.data) {
        const data: {codes: Array<County>} = dataset.data as {codes: Array<County>}
        return data.codes
      }
    }
  }
  return []
}

export interface CountiesLib {
  list: () => Array<County>;
}

export interface County {
  code: string;
  parentCode?: string;
  level: string;
  name: string;
  shortName: string;
  presentationName: string;
}
