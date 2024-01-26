import { get as getContentByKey, type Content } from '/lib/xp/content'
import { pageUrl, getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'
import * as util from '/lib/util'
import { type MenuBox } from '/site/content-types'

const view = resolve('./menuBox.html')

export function get(req: XP.Request): XP.Response | string {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response | string {
  const part = getComponent<XP.PartComponent.MenuBox>()
  if (!part) throw Error('No part found')

  const menuBoxId: string = part.config.menu
  const height: string = part.config.height ? (part.config.height as string) : 'default'
  if (!menuBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          title: 'Liste profilerte kort',
          message: 'MenuBox - Missing Id',
        }),
      }
    } else {
      throw new Error('MenuBox - Missing Id')
    }
  }
  const menuBoxContent: Content<MenuBox> | null = getContentByKey({
    key: menuBoxId,
  })
  if (!menuBoxContent) throw new Error(`MenuBox with id ${menuBoxId} doesn't exist`)

  const boxes: Array<MenuItem> = buildMenu(menuBoxContent)

  const props: MenuBoxProps = {
    boxes,
    height,
    anchor: part.config.anchor ?? '',
  }

  return r4XpRender('MenuBox', props, req)
}

function buildMenu(menuBoxContent: Content<MenuBox>): Array<MenuItem> {
  const menuItems: Array<MenuConfig | undefined> = util.data.forceArray(menuBoxContent.data.menu)
  return menuItems
    ? menuItems.map((box: MenuConfig | undefined): MenuItem => {
        const boxTitle: string = box?.title ? box.title : ''
        const titleSize: string = getTitleSize(boxTitle)
        return {
          title: boxTitle,
          subtitle: box?.subtitle ? box.subtitle : '',
          icon: box?.image ? getIcon(box.image) : undefined,
          href: box ? getHref(box) : '',
          titleSize,
        }
      })
    : []
}

function getIcon(iconId: string): Image | undefined {
  if (iconId) {
    return {
      src: imageUrl({
        id: iconId,
        scale: 'block(100,100)',
        format: 'jpg',
      }),
      alt: getImageAlt(iconId) ? getImageAlt(iconId) : '',
    }
  } else {
    return undefined
  }
}

function getHref(menuConfig: MenuConfig): string {
  if (menuConfig.urlSrc && menuConfig.urlSrc._selected === 'manual') {
    return menuConfig.urlSrc.manual.url
  } else if (menuConfig.urlSrc && menuConfig.urlSrc.content) {
    return pageUrl({
      id: menuConfig.urlSrc.content.contentId,
    })
  }
  return ''
}

function getTitleSize(title: string): string {
  const titleLength: number = title.length
  let titleSize = 'sm'
  if (titleLength > 25) {
    titleSize = 'md'
  }
  if (titleLength > 50) {
    titleSize = 'lg'
  }
  return titleSize
}

interface MenuBoxProps {
  boxes: Array<MenuItem>
  height: string
  anchor: string
}

interface MenuConfig {
  title?: string
  subtitle?: string
  image?: string
  urlSrc?: hrefManual | hrefContent
}

interface hrefManual {
  _selected: 'manual'
  manual: {
    url: string
  }
}

interface hrefContent {
  _selected: 'content'
  content: {
    contentId: string
  }
}

interface MenuItem {
  title: string
  subtitle: string
  icon: Image | undefined
  href: string
  titleSize: string
}

interface Image {
  src: string
  alt: string | undefined
}
