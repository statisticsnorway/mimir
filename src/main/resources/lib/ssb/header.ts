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
  assetUrl
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
      logoUrl: assetUrl({
        path: 'SSB_logo_black.svg'
      }),
      logoAltText: localize({
        key: 'logoAltText',
        locale: language.code
      }),
      searchResultPageUrl: headerContent.data.searchResultPage ? pathFromStringOrContent(headerContent.data.searchResultPage) : undefined,
      searchText: localize({
        key: 'menuSearch',
        locale: language.code
      }),
      skipToContentText: localize({
        key: 'skipToContent',
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
    logoAltText: string;
    searchResultPageUrl?: string;
    searchText: string;
    mainNavigation?: Array<MenuItem>;
    topLinks?: Array<Link>;
    language: Language;
    skipToContentText: string;
}

