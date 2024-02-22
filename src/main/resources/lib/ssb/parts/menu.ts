import { get, getChildren, query, Content, ContentsResult } from '/lib/xp/content'

import { pageUrl } from '/lib/xp/portal'
import { getAttachment } from '/lib/ssb/utils/utils'
import { type MenuItem, type Footer, type Header } from '/site/content-types'

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
    const menuContentChildren = getChildren({
      count: 100,
      key: menuContent._id,
    })

    const parsedMenu: Array<MenuItemParsed> = menuContentChildren.hits.map((menuItem) => createMenuBranch(menuItem))
    const flatMenu: Array<MenuItemParsed> = flattenMenu(parsedMenu)
    query({
      count: flatMenu.length,
      query: `_id IN(${flatMenu.map((menuItem) => `"${menuItem.iconId}"`).join(',')}) AND type = "media:vector"`,
    }).hits.forEach((icon) => {
      const menuItem: MenuItemParsed | undefined = flatMenu.find((fm) => fm.iconId === icon._id)
      if (menuItem) {
        menuItem.iconAltText = icon ? (icon.data.caption as string) : ''
        menuItem.iconSvgTag = icon ? getAttachment(icon) : undefined
      }
    })
    return parsedMenu
  }
  return []
}

export function isMenuItemActive(children: ContentsResult<Content<MenuItem>>, content: Content | null): boolean {
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
