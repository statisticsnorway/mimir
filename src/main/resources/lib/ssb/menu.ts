import {Content, ContentLibrary, QueryResponse} from 'enonic-types/lib/content';
import {PortalLibrary} from 'enonic-types/lib/portal';
import {MenuItem} from '../../site/content-types/menuItem/menuItem';
import {SiteConfig} from '../../site/site-config';
import { Footer } from '../../site/content-types/footer/footer'

const { getContent, imageUrl, pageUrl }: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const { get, getChildren }: ContentLibrary = __non_webpack_require__( '/lib/xp/content')


export function createMenuTree(menuItemId: string): Array<MenuItemParsed> {
  const menuContent: Content<MenuItem> | null = get({key: menuItemId})

  if(menuContent !== null) {
    const menuContentChildren: QueryResponse<MenuItem> = getChildren({key: menuContent._id})
    return menuContentChildren.hits.map( (menuItem) => createMenuBranch(menuItem))
  }

  return []
}

function createMenuBranch(menuItem: Content<MenuItem>): MenuItemParsed {
  const path: string | undefined = menuItem.data.urlSrc ? parseUrl(menuItem.data.urlSrc): '-'
  const children: QueryResponse<MenuItem> = getChildren({key: menuItem._id})
  const content: Content | null = getContent();
  const isActive: boolean = children.total > 0 && content ? children.hits.reduce( (hasActiveChildren: boolean, child: Content<MenuItem>) => {
    if( child.data.urlSrc && child.data.urlSrc._selected === 'content' &&
        child.data.urlSrc.content && child.data.urlSrc.content.contentId === content._id) {
      hasActiveChildren = true
    }
    return hasActiveChildren
  }, false) : false
  return {
    title: menuItem.displayName,
    shortName: menuItem.data.shortName ? menuItem.data.shortName : undefined,
    path,
    isActive,
    icon: menuItem.data.icon ? imageUrl({id: menuItem.data.icon, scale: 'block(12px,12px)'}) : undefined,
    menuItems: children.total > 0 ? children.hits.map((childMenuItem) => createMenuBranch(childMenuItem)) : undefined
  }
}

type TopLinks = SiteConfig['topLinks']
export function parseTopLinks(topLinks: TopLinks): Array<Link> | undefined {
  return topLinks ? topLinks.map((link) => ({
    title: link.linkTitle,
    path: parseUrl(link.urlSrc)
  })) : undefined
}

type GlobalLinks = Footer['globalLinks']
export function parseGlobalLinks(globalLinks: GlobalLinks): Array<Link> | undefined {
  return globalLinks ? globalLinks.map((link) => ({
    title: link.linkTitle,
    path: parseUrl(link.urlSrc)
  })) : undefined
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

export interface MenuItemParsed extends MenuItem {
  title: string;
  path?: string;
  isActive: boolean;
  menuItems?: Array<MenuItem> | undefined;
}

export interface Link {
  title: string;
  path?: string;
}