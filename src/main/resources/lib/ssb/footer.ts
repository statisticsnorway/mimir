import { PortalLibrary } from 'enonic-types/lib/portal'
import { MenuItem } from '../../site/content-types/menuItem/menuItem'
import { Language } from '../types/language'
const {
  assetUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  createMenuTree
} = __non_webpack_require__( '/lib/ssb/menu')

export function getFooterContent(language: Language): Footer {
  return {
    logoUrl: assetUrl({
      path: 'SSB_logo_white.svg'
    }),
    mainNavigation: language.footerContentId ? createMenuTree(language.footerContentId) : []
  }
}

export interface Footer{
    logoUrl: string;
    mainNavigation?: Array<MenuItem>;
}
