import { type MenuItem } from '/site/content-types'
import { type Language } from './language'

export interface HeaderContent {
  logoUrl: string
  logoSrc: string
  logoAltText: string
  searchResultPageUrl?: string
  searchResult?: string
  searchText: string
  mainMenuText: string
  mainNavigation: Array<MenuItemParsed>
  topLinks?: Array<Link>
  skipToContentText: string
  language?: Language
  closeText: string
  menuText: string
}

export interface UrlContent {
  contentId?: string
  url?: string
}

export interface MenuItemParsed extends MenuItem {
  title: string
  path?: string
  isActive: boolean
  iconId?: string
  iconAltText?: string
  iconSvgTag?: string
  menuItems?: Array<MenuItemParsed> | undefined
}

export interface Link {
  title: string
  path?: string
}
