import { Content, ContentLibrary } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Component } from 'enonic-types/portal'
import { MenuBoxPartConfig } from '../menuBox/menuBox-part-config'
import { MenuBox } from '../../content-types/menuBox/menuBox'

const {
  getComponent,
  imageUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')

const content: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const view: ResourceKey = resolve('./menuBox.html')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp

exports.get = function(req:Request):Response | React4xpResponse | string {
  try {
    const part:Component<MenuBoxPartConfig> = getComponent()
    return renderPart(req, part.config.menu)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req:Request, id: string):Response | React4xpResponse | string {
  return renderPart(req, id)
}

function renderPart(req:Request, menuBoxId: string):Response | React4xpResponse | string {
  if (!menuBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      throw new Error('MenuBox - Missing Id')
    }
  }
  const menuBoxContent: Content<MenuBox> | null = content.get({
    key: menuBoxId
  })
  if (!menuBoxContent) throw new Error(`MenuBox with id ${menuBoxId} doesn't exist`)

  const boxes: Array<MenuItem> = buildMenu(menuBoxContent)
  const menuBox: React4xpObject = new React4xp('MenuBox')
    .setProps({
      boxes
    })
    .uniqueId()

  const body: string = render(view, {
    menuBoxId: menuBox.react4xpId
  })
  return {
    body: menuBox.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: menuBox.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}

function buildMenu(menuBoxContent: Content<MenuBox> ): Array<MenuItem> {
  const menuItems: Array<MenuConfig | undefined> = forceArray(menuBoxContent.data.menu)
  return menuItems ? menuItems.map((box: MenuConfig| undefined): MenuItem => {
    return {
      title: box?.title ? box.title : '',
      subtitle: box?.subtitle ? box.subtitle : '',
      icon: box?.image ? getIcon(box.image) : undefined,
      href: box ? getHref(box) : ''
    }
  }) : []
}

function getIcon(iconId: string): Image | undefined {
  if (iconId) {
    return {
      src: imageUrl({
        id: iconId,
        scale: 'block(100,100)'
      }),
      alt: getImageAlt(iconId) ? getImageAlt(iconId) : ' '
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
      id: menuConfig.urlSrc.content.contentId
    })
  }
  return ''
}

interface MenuConfig {
  title?: string,
  subtitle?: string,
  image?: string,
  urlSrc?: hrefManual | hrefContent
}

interface hrefManual {
  _selected: 'manual',
  manual: {
    url: string
  }
}

interface hrefContent {
  _selected: 'content',
  content: {
    contentId: string
  }
}

interface MenuItem {
  title: string,
  subtitle: string,
  icon: Image | undefined,
  href: string
}

interface Image {
  src: string,
  alt: string | undefined
}
