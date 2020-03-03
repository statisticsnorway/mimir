import { PortalLibrary } from 'enonic-types/lib/portal'
import { MenuItem } from '../../site/content-types/menuItem/menuItem'
import { Language } from '../types/language'
import { Link } from './menu'
import { Content, ContentLibrary } from 'enonic-types/lib/content'
import { Footer } from '../../site/content-types/footer/footer'
const {
  assetUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  get
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  createMenuTree, parseGlobalLinks
} = __non_webpack_require__( '/lib/ssb/menu')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')

export function getFooterContent(language: Language): FooterContent | null {
  if (language.footerId) {
    const footerContent: Content<Footer> | null = get({
      key: language.footerId
    })

    if (footerContent !== null) {
      return {
        logoUrl: assetUrl({
          path: 'SSB_logo_white.svg'
        }),
        facebookUrl: footerContent.data.facebookUrl,
        twitterUrl: footerContent.data.twitterUrl,
        linkedinUrl: footerContent.data.linkedinUrl,
        rssUrl: footerContent.data.rssUrl,
        globalLinks: footerContent.data.globalLinks && footerContent.data.globalLinks.length > 0 ? parseGlobalLinks(footerContent) : [],
        footerNavigation: footerContent.data.footerContentId ? createMenuTree(footerContent.data.footerContentId) : [],
        topButtonText: localize({
          key: 'toTheTop',
          locale: language.code
        })
      }
    }
  }

  return null
}

export interface FooterContent{
    logoUrl: string;
    facebookUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    rssUrl: string;
    globalLinks: Array<Link>;
    footerNavigation?: Array<MenuItem>;
    topButtonText?: string;
}
