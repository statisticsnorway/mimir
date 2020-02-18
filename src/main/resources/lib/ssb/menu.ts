import {SiteConfig} from '../../site/site-config';
import {ContentLibrary, Content, ContentType, QueryResponse} from "enonic-types/lib/content";
import {PortalLibrary} from 'enonic-types/lib/portal';
import {MenuItem} from '../../site/content-types/menuItem/menuItem';
const { getSiteConfig, imageUrl, pageUrl }: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const { get, getChildren }: ContentLibrary = __non_webpack_require__( '/lib/xp/content')

export function getMenu(): Header {
  const siteConfig: SiteConfig = getSiteConfig();
  return {
    searchPageUrl: siteConfig.searchResultPageId ?  pageUrl({id: siteConfig.searchResultPageId}): undefined,
    menu: siteConfig.menuItemId? createMenuTree(siteConfig.menuItemId) : [],
    topLinks: parseTopLinks()
  }
}

function createMenuTree(menuItemId: string): Array<Array<MenuItemParsed>> {
  const menuContent: Content<MenuItem> | null = get({key: menuItemId})

  if(menuContent !== null) {
    const menuContentChildren: QueryResponse<MenuItem> = getChildren({key: menuContent._id})
    return menuContentChildren.hits.map( (menuItem) => createMenuBranch(menuItem))
  }

  return []
}

function createMenuBranch(menuItem: Content<MenuItem>): Array<MenuItemParsed> {
  const url: string | undefined = menuItem.data.urlSrc ? parseUrl(menuItem.data.urlSrc): ''
  const children: QueryResponse<MenuItem> = getChildren({key: menuItem._id})
  return [{
    title: menuItem.displayName,
    shortName: menuItem.data.shortName ? menuItem.data.shortName : undefined,
    url,
    icon: menuItem.data.icon ? imageUrl({id: menuItem.data.icon, scale: 'block(100,100)'}) : undefined,
    menuItems: children.total > 0 ? children.hits.map((childMenuItem) => createMenuBranch(childMenuItem)) : undefined
  }]
}

function parseTopLinks(): Array<Link> {
  return [{
    title: '',
    url: ''
  }]
}

function parseUrl(urlSrc: MenuItem['urlSrc']): string | undefined {
  if(urlSrc !== undefined) {
    if(urlSrc._selected === 'content') {
      const selected: UrlContent | undefined = urlSrc[urlSrc._selected]
      return selected && selected.contentId ? pageUrl({id: selected.contentId}) : undefined
    }

    if(urlSrc._selected === 'manual') {
      const selected: UrlContent | undefined = urlSrc[urlSrc._selected]
      return selected && selected.url ? selected.url : undefined
    }
  }

  return undefined
}

interface UrlContent {
  contentId?: string;
  url?: string;
}

export interface Header{
  searchPageUrl?: string | undefined;
  menu?: Array<Array<MenuItem>>;
  topLinks?: Array<Link>;
}

export interface MenuItemParsed extends MenuItem {
  title: string;
  url?: string;
  menuItems?: Array<Array<MenuItem>> | undefined;
}

export interface Link {
  title: string;
  url?: string;
}
