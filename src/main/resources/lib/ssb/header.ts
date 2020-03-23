import { SiteConfig } from '../../site/site-config'
import { PortalLibrary } from 'enonic-types/lib/portal'
import { Language } from '../types/language'
import { Content, ContentLibrary } from 'enonic-types/lib/content'
import { Header } from '../../site/content-types/header/header'
import { Link } from './menu'
import { MenuItem } from '../../site/content-types/menuItem/menuItem'
const {
  get
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getSiteConfig, imageUrl, pageUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  createMenuTree, parseTopLinks
} = __non_webpack_require__( '/lib/ssb/menu')
const {
  pathFromStringOrContent
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')

export function getHeaderContent(language: Language): HeaderContent | undefined {
  if (language.headerId === undefined || language.headerId === null) {
    return undefined
  } else {
    const headerContent: Content<Header> | null = get({
      key: language.headerId
    })

    if (!headerContent) throw new Error(`Could not get header content with id ${language.headerId}`)

    return {
      logoUrl: headerContent.data.logo ? imageUrl({
        id: headerContent.data.logo,
        scale: 'width(248)'
      }) : 'Image not set in header content',
      searchResultPageUrl: headerContent.data.searchResultPage ? pathFromStringOrContent(headerContent.data.searchResultPage) : undefined,
      searchInputPlaceholder: localize({
        key: 'menuSearch',
        locale: language.code
      }),
      mainNavigation: headerContent.data.menuContentId ? createMenuTree(headerContent.data.menuContentId) : [],
      topLinks: headerContent.data.globalLinks && headerContent.data.globalLinks.length > 0 ? parseTopLinks(headerContent.data.globalLinks) : undefined,
      language
    }
  }
}


export interface HeaderContent {
    logoUrl: string;
    searchResultPageUrl?: string;
    searchInputPlaceholder: string;
    mainNavigation?: Array<MenuItem>;
    topLinks?: Array<Link>;
    language: Language;
}

