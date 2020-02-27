import { PortalLibrary } from 'enonic-types/lib/portal'
import { MenuItem } from '../../site/content-types/menuItem/menuItem'
import { Language } from '../types/language'
import { SiteConfig } from '../../site/site-config'
import { Link } from './menu'
const {
  getSiteConfig
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  assetUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  createMenuTree, parseBottomLinks
} = __non_webpack_require__( '/lib/ssb/menu')

export function getFooterContent(language: Language): Footer {
  const siteConfig: SiteConfig = getSiteConfig()
  return {
    logoUrl: assetUrl({
      path: 'SSB_logo_white.svg'
    }),
    bottomLinks: siteConfig.bottomLinks && siteConfig.bottomLinks.length > 0 ? parseBottomLinks(siteConfig.bottomLinks, language.code) : undefined,
    mainNavigation: language.footerContentId ? createMenuTree(language.footerContentId) : []
  }
}

export interface Footer{
    logoUrl: string;
    bottomLinks?: Array<Link>;
    mainNavigation?: Array<MenuItem>;
}
