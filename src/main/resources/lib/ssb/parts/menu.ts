import { Content, Image, QueryResponse } from 'enonic-types/content'
import { MenuItem } from '../../../site/content-types/menuItem/menuItem'
import { Footer } from '../../../site/content-types/footer/footer'
import { Header } from '../../../site/content-types/header/header'

const {
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get, getChildren, query
} = __non_webpack_require__('/lib/xp/content')
const {
  getAttachment
} = __non_webpack_require__('/lib/ssb/utils/utils')

function flattenMenu(menuItems: Array<MenuItemParsed>): Array<MenuItemParsed> {
  return menuItems.reduce((acc: Array<MenuItemParsed>, menuItem) => {
    acc = acc.concat(menuItem)
    if (menuItem.menuItems) {
      acc = acc.concat(flattenMenu(menuItem.menuItems))
    }
    return acc
  }, [])
}

function createMenuBranch(menuItem: Content<MenuItem>, depth: number = 0): MenuItemParsed {
  const path: string | undefined = menuItem.data.urlSrc ? parseUrl(menuItem.data.urlSrc) : '-'
  const children: Array<Content<MenuItem>> | [] = depth < 1 ? query({
    contentTypes: [`${app.name}:menuItem`],
    query: `_parentPath = '/content${menuItem._path}'`,
    count: 99
  }).hits as unknown as Array<Content<MenuItem>> : []
  const isActive: boolean = false
  return {
    title: menuItem.displayName,
    shortName: menuItem.data.shortName ? menuItem.data.shortName : undefined,
    path,
    isActive,
    iconId: menuItem.data.icon,
    menuItems: children.length > 0 ? children.map((childMenuItem) => createMenuBranch(childMenuItem, depth + 1)) : undefined
  }
}

export function createMenuTree(menuItemId: string): Array<MenuItemParsed> {
  const menuContent: Content<MenuItem> | null = get({
    key: menuItemId
  })

  if (menuContent) {
    const menuContentChildren: QueryResponse<MenuItem> = getChildren({
      count: 100,
      key: menuContent._id
    })

    const parsedMenu: Array<MenuItemParsed> = menuContentChildren.hits.map((menuItem) => createMenuBranch(menuItem))
    const flatMenu: Array<MenuItemParsed> = flattenMenu(parsedMenu)
    query<Image>({
      count: flatMenu.length,
      query: `_id IN(${flatMenu.map((menuItem) => `"${menuItem.iconId}"`).join(',')}) AND type = "media:vector"`
    }).hits.forEach((icon) => {
      const menuItem: MenuItemParsed | undefined = flatMenu.find((fm) => fm.iconId === icon._id)
      if (menuItem) {
        menuItem.iconAltText = icon ? icon.data.caption : ' '
        menuItem.iconSvgTag = icon ? getAttachment(icon) : undefined
      }
    })
    return parsedMenu
  }
  return []
}

export function isMenuItemActive(children: QueryResponse<MenuItem>, content: Content | null): boolean {
  return children.total > 0 && content && content._path ? children.hits.reduce( (hasActiveChildren: boolean, child: Content<MenuItem>) => {
    if (child.data.urlSrc?.content?.contentId && child.data.urlSrc.content.contentId === content._id) {
      hasActiveChildren = true
    } else if (child.data.urlSrc?.manual?.url && content._path.indexOf(child.data.urlSrc.manual.url) > 0) {
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
  iconId?: string;
  iconAltText?: string;
  iconSvgTag?: string;
  menuItems?: Array<MenuItemParsed> | undefined;
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
  getMenuIcons: (menuItemId: string) => Array<object>;
}
