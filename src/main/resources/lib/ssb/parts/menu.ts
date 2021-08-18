import { Content, QueryResponse } from 'enonic-types/content'
import { MenuItem } from '../../../site/content-types/menuItem/menuItem'
import { Footer } from '../../../site/content-types/footer/footer'
import { Header } from '../../../site/content-types/header/header'

const {
  imageUrl, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get, getChildren, query
} = __non_webpack_require__('/lib/xp/content')
const {
  getAttachmentContent
} = __non_webpack_require__('/lib/ssb/utils/utils')
const {
  getImageCaption
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')

export function createMenuTree(menuItemId: string): Array<MenuItemParsed> {
  const menuContent: Content<MenuItem> | null = get({
    key: menuItemId
  })

  if (menuContent !== null) {
    const menuContentChildren: QueryResponse<MenuItem> = getChildren({
      count: 100,
      key: menuContent._id
    })
    return menuContentChildren.hits.map( (menuItem) => createMenuBranch(menuItem) )
  }
  return []
}

function createMenuBranch(menuItem: Content<MenuItem>): MenuItemParsed {
  const path: string | undefined = menuItem.data.urlSrc ? parseUrl(menuItem.data.urlSrc) : '-'
  const children: QueryResponse<MenuItem> = query({
    contentTypes: [`${app.name}:menuItem`],
    query: `_parentPath = '/content${menuItem._path}'`,
    count: 99
  })
  // const content: Content | null = getContent()
  const isActive: boolean = false // isMenuItemActive(children, content)
  const iconPath: string | undefined = menuItem.data.icon ? imageUrl({
    id: menuItem.data.icon,
    scale: 'block(12,12)'
  }) : undefined
  const iconAltText: string | undefined = menuItem.data.icon ? getImageCaption(menuItem.data.icon) : undefined
  const iconSvgTag: string | undefined = menuItem.data.icon ? getAttachmentContent( menuItem.data.icon) : undefined
  return {
    title: menuItem.displayName,
    shortName: menuItem.data.shortName ? menuItem.data.shortName : undefined,
    path,
    isActive,
    icon: iconPath && iconPath.search('error') === -1 ? iconPath : undefined,
    iconAltText,
    iconSvgTag,
    menuItems: children.total > 0 ? children.hits.map((childMenuItem) => createMenuBranch(childMenuItem)) : undefined
  }
}

export function isMenuItemActive(children: QueryResponse<MenuItem>, content: Content | null): boolean {
  return children.total > 0 && content && content._path ? children.hits.reduce( (hasActiveChildren: boolean, child: Content<MenuItem>) => {
    if (child.data.urlSrc?._selected === 'content' && child.data.urlSrc?.content?.contentId && child.data.urlSrc.content.contentId === content._id) {
      hasActiveChildren = true
    } else if (child.data.urlSrc?._selected === 'manual' && child.data.urlSrc?.manual?.url && content._path.indexOf(child.data.urlSrc.manual.url) > 0) {
      hasActiveChildren = true
    }
    return hasActiveChildren
  }, false) : false
}

type TopLinks = Header['globalLinks']
export function parseTopLinks(topLinks: TopLinks): Array<Link> {
  return topLinks ? topLinks.map((link) => ({
    title: link.linkTitle,
    path: parseUrl(link.urlSrc)
  })) : []
}

type GlobalLinks = Footer['globalLinks']
export function parseGlobalLinks(globalLinks: GlobalLinks): Array<Link> {
  return globalLinks ? globalLinks.map((link) => ({
    title: link.linkTitle,
    path: parseUrl(link.urlSrc)
  })) : []
}

function parseUrl(urlSrc: MenuItem['urlSrc']): string | undefined {
  if (urlSrc !== undefined) {
    if (urlSrc._selected === 'content') {
      const selected: UrlContent | undefined = urlSrc[urlSrc._selected]
      return selected && selected.contentId ? pageUrl({
        id: selected.contentId
      }) : undefined
    }

    if (urlSrc._selected === 'manual') {
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
  iconAltText?: string;
  iconSvgTag?: string;
  menuItems?: Array<MenuItem> | undefined;
}

export interface Link {
  title: string;
  path?: string;
}

export interface MenuLib {
  createMenuTree: (menuItemId: string) => Array<MenuItemParsed>;
  isMenuItemActive: (children: QueryResponse<MenuItem>, content: Content | null) => boolean;
  parseTopLinks: (topLinks: TopLinks) => Array<Link>;
  parseGlobalLinks: (globalLinks: GlobalLinks) => Array<Link>;
}
