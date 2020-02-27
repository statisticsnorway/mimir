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
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')

export function getFooterContent(language: Language): Footer {
  const siteConfig: SiteConfig = getSiteConfig()
  return {
    logoUrl: assetUrl({
      path: 'SSB_logo_white.svg'
    }),
    bottomLinks: siteConfig.bottomLinks && siteConfig.bottomLinks.length > 0 ? parseBottomLinks(siteConfig.bottomLinks, language.code) : undefined,
    footerNavigation: language.footerContentId ? createMenuTree(language.footerContentId) : [],
    topButtonText: localize({
      key: 'toTheTop',
      locale: language.code
    })
  }
}

export interface Footer{
    logoUrl: string;
    bottomLinks?: Array<Link>;
    footerNavigation?: Array<MenuItem>;
    topButtonText?: string;
}
