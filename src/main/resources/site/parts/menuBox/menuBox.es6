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

const content = __non_webpack_require__('/lib/xp/content')
const view = resolve('./menuBox.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    const part = getComponent()
    return renderPart(req, part.config.menu)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, id) {
  return renderPart(req, id)
}

function renderPart(req, menuBoxId) {
  if (!menuBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      throw new Error('MenuBox - Missing Id')
    }
  }
  const menuBoxContent = content.get({
    key: menuBoxId
  })
  if (!menuBoxContent) throw new Error(`MenuBox with id ${menuBoxId} doesn't exist`)

  const boxes = buildMenu(menuBoxContent)
  const menuBox = new React4xp('MenuBox')
    .setProps({
      boxes
    })
    .uniqueId()

  const body = render(view, {
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

/**
 * builds the menu items based on menu-box menu data
 * @param {object} menuBoxContent
 * @return {array<object>}
 */
function buildMenu(menuBoxContent) {
  return menuBoxContent.data.menu.map((box) => {
    return {
      title: box.title,
      subtitle: box.subtitle,
      icon: getIcon(box.image),
      href: getHref(box)
    }
  })
}

function getIcon(iconId) {
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

/**
 * get menu item href
 * @param {object} menuConfig
 * @return {string}
 */
function getHref(menuConfig) {
  if (menuConfig.urlSrc && menuConfig.urlSrc._selected === 'manual') {
    return menuConfig.urlSrc.manual.url
  } else if (menuConfig.urlSrc && menuConfig.urlSrc.content) {
    return pageUrl({
      id: menuConfig.urlSrc.content.contentId
    })
  }
  return ''
}
