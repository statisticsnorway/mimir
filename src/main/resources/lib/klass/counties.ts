import { PortalLibrary } from 'enonic-types/lib/portal'
import { SiteConfig } from '../../site/site-config'
import { Content, ContentLibrary } from 'enonic-types/lib/content'
import { Dataset } from '../../site/content-types/dataset/dataset'
const { getSiteConfig }: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const { getChildren }: ContentLibrary = __non_webpack_require__( '/lib/xp/content')

/**
 *
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list: () => Array<County> = () => getCountiesFromContent()


function getCountiesFromContent(): Array<County> {
  const siteConfig: SiteConfig = getSiteConfig()
  const key: string | undefined = siteConfig.countyDataContentId
  if (key) {
    const children: Array<Content<Dataset>> = getChildren({ key }).hits as Array<Content<Dataset>>
    if (children.length > 0) {
      const content: Content<Dataset> = children[0]
      if (content.data.json) {
        return JSON.parse(content.data.json).codes as Array<County>
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
