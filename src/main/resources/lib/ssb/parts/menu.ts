import { get, getChildren, query, Content, QueryResponse, MediaImage } from '/lib/xp/content'
import type { MenuItem, Footer, Header } from '../../../site/content-types'

const { pageUrl } = __non_webpack_require__('/lib/xp/portal')
const { getAttachment } = __non_webpack_require__('/lib/ssb/utils/utils')

function flattenMenu(menuItems: Array<MenuItemParsed>): Array<MenuItemParsed> {
  return menuItems.reduce((acc: Array<MenuItemParsed>, menuItem) => {
    acc = acc.concat(menuItem)
    if (menuItem.menuItems) {
      acc = acc.concat(flattenMenu(menuItem.menuItems))
    }
    return acc
  }, [])
}

function createMenuBranch(menuItem: Content<MenuItem>, depth = 0): MenuItemParsed {
  const path: string | undefined = menuItem.data.urlSrc ? parseUrl(menuItem.data.urlSrc) : '-'
  const children: Array<Content<MenuItem>> | [] =
    depth < 1
      ? (getChildren({
          count: 99,
          key: menuItem._path,
        }).hits as unknown as Array<Content<MenuItem>>)
      : []
  const isActive = false
  return {
    title: menuItem.displayName,
    shortName: menuItem.data.shortName ? menuItem.data.shortName : undefined,
    path,
    isActive,
    iconId: menuItem.data.icon,
    menuItems:
      children.length > 0 ? children.map((childMenuItem) => createMenuBranch(childMenuItem, depth + 1)) : undefined,
  }
}

export function createMenuTree(menuItemId: string): Array<MenuItemParsed> {
  const menuContent: Content<MenuItem> | null = get({
    key: menuItemId,
  })

  if (menuContent) {
    const menuContentChildren: QueryResponse<MenuItem, object> = getChildren({
      count: 100,
      key: menuContent._id,
    })

    const parsedMenu: Array<MenuItemParsed> = menuContentChildren.hits.map((menuItem) => createMenuBranch(menuItem))
    const flatMenu: Array<MenuItemParsed> = flattenMenu(parsedMenu)
    query<MediaImage, object>({
      count: flatMenu.length,
      query: `_id IN(${flatMenu.map((menuItem) => `"${menuItem.iconId}"`).join(',')}) AND type = "media:vector"`,
    }).hits.forEach((icon) => {
      const menuItem: MenuItemParsed | undefined = flatMenu.find((fm) => fm.iconId === icon._id)
      if (menuItem) {
        menuItem.iconAltText = icon ? icon.data.caption : ' '
        menuItem.iconSvgTag = icon ? (getAttachment(icon) as string).replace(/<title>(.*)<\/title>/g, '') : undefined
        log.info(JSON.stringify(menuItem.iconSvgTag, null, 2))
      }
    })
    return parsedMenu
  }
  return []
}

export function isMenuItemActive(children: QueryResponse<MenuItem, object>, content: Content | null): boolean {
  return children.total > 0 && content && content._path
    ? children.hits.reduce((hasActiveChildren: boolean, child: Content<MenuItem>) => {
        if (
          child.data.urlSrc?._selected === 'content' &&
          child.data.urlSrc?.content?.contentId &&
          child.data.urlSrc.content.contentId === content._id
        ) {
          hasActiveChildren = true
        } else if (
          child.data.urlSrc?._selected === 'manual' &&
          child.data.urlSrc?.manual?.url &&
          content._path.indexOf(child.data.urlSrc.manual.url) > 0
        ) {
          hasActiveChildren = true
        }
        return hasActiveChildren
      }, false)
    : false
}

type TopLinks = Header['globalLinks']
export function parseTopLinks(topLinks: TopLinks): Array<Link> {
  return topLinks
    ? topLinks.map((link) => ({
        title: link.linkTitle,
        path: parseUrl(link.urlSrc),
      }))
    : []
}

type GlobalLinks = Footer['globalLinks']
export function parseGlobalLinks(globalLinks: GlobalLinks): Array<Link> {
  return globalLinks
    ? globalLinks.map((link) => ({
        title: link.linkTitle,
        path: parseUrl(link.urlSrc),
      }))
    : []
}

function parseUrl(urlSrc: MenuItem['urlSrc']): string | undefined {
  if (urlSrc !== undefined) {
    if (urlSrc._selected === 'content') {
      const selected: UrlContent | undefined = urlSrc[urlSrc._selected]
      return selected && selected.contentId
        ? pageUrl({
            id: selected.contentId,
          })
        : undefined
    }

    if (urlSrc._selected === 'manual') {
      const selected: UrlContent | undefined = urlSrc[urlSrc._selected]
      return selected && selected.url ? selected.url : undefined
    }
  }

  return undefined
}

interface UrlContent {
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

export interface MenuLib {
  createMenuTree: (menuItemId: string) => Array<MenuItemParsed>
  isMenuItemActive: (children: QueryResponse<MenuItem, object>, content: Content | null) => boolean
  parseTopLinks: (topLinks: TopLinks) => Array<Link>
  parseGlobalLinks: (globalLinks: GlobalLinks) => Array<Link>
  getMenuIcons: (menuItemId: string) => Array<object>
}
