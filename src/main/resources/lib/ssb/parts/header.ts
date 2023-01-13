import { Language } from '/lib/types/language'
import { get, Content } from '/lib/xp/content'
import type { Header, MenuItem } from '/site/content-types'
import { Link } from '/lib/ssb/parts/menu'
const { assetUrl } = __non_webpack_require__('/lib/xp/portal')
const { createMenuTree, parseTopLinks } = __non_webpack_require__('/lib/ssb/parts/menu')
const { pathFromStringOrContent } = __non_webpack_require__('/lib/ssb/utils/utils')
const { localize } = __non_webpack_require__('/lib/xp/i18n')

export function getHeaderContent(language: Language): HeaderContent | undefined {
  if (language.headerId === undefined || language.headerId === null) {
    return undefined
  } else {
    const headerContent: Content<Header> | null = get({
      key: language.headerId,
    })

    if (!headerContent) throw new Error(`Could not get header content with id ${language.headerId}`)

    return {
      logoUrl: language.link as string,
      logoSrc: assetUrl({
        path: 'SSB_logo_black.svg',
      }),
      logoAltText: localize({
        key: 'logoAltText',
        locale: language.code,
      }),
      searchResultPageUrl: headerContent.data.searchResultPage
        ? pathFromStringOrContent(headerContent.data.searchResultPage)
        : undefined,
      searchText: localize({
        key: 'menuSearch',
        locale: language.code,
      }),
      skipToContentText: localize({
        key: 'skipToContent',
        locale: language.code,
      }),
      closeText: localize({
        key: 'close',
        locale: language.code,
      }),
      menuText: localize({
        key: 'menu',
        locale: language.code,
      }),
      mainMenuText: localize({
        key: 'mainSearch',
        locale: language.code,
      }),
      mainNavigation: headerContent.data.menuContentId ? createMenuTree(headerContent.data.menuContentId) : [],
      topLinks:
        headerContent.data.globalLinks && headerContent.data.globalLinks.length > 0
          ? parseTopLinks(headerContent.data.globalLinks)
          : undefined,
    }
  }
}

export interface HeaderContent {
  logoUrl: string
  logoSrc: string
  logoAltText: string
  searchResultPageUrl?: string
  searchText: string
  mainMenuText: string
  mainNavigation?: Array<MenuItem>
  topLinks?: Array<Link>
  skipToContentText: string
  closeText: string
  menuText: string
}

export interface HeaderLib {
  getHeaderContent: (language: Language) => HeaderContent | undefined
}
