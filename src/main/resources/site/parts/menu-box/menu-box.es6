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
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const view = resolve('./menu-box.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    return renderPart(req, part.config.menu)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = function(req, id) {
  return renderPart(req, id)
}

function renderPart(req, menuBoxId) {
  let menus
  if (menuBoxId) {
    const menuBox = content.get({
      key: menuBoxId
    })
    if (menuBox && menuBox.data.menu) {
      const menuConfigs = menuBox.data.menu ? util.data.forceArray(menuBox.data.menu) : []
      menus = buildMenu(menuConfigs)
    }
  }
  const body = render(view, {
    menus
  })

  return {
    body,
    contentType: 'text/html'
  }
}

/**
 * builds the menu items based on menu-box menu data
 * @param {array<object>} menuConfigs
 * @return {array<object>}
 */
function buildMenu(menuConfigs) {
  return menuConfigs.map((menuConfig) => {
    let imageSrc = ''
    if (menuConfig.image) {
      imageSrc = imageUrl({
        id: menuConfig.image,
        scale: 'block(400,400)'
      })
    }

     return {
      title: menuConfig.title,
      subtitle: menuConfig.subtitle,
      href: getHref(menuConfig),
      hasImage: !!imageSrc,
      imageSrc
    }
  })
}

/**
 * get menu item href
 * @param {object} menuConfig
 * @return {string}
 */
function getHref(menuConfig) {
  if (menuConfig.link) {
    return menuConfig.link
  } else if (menuConfig.content) {
    return pageUrl({
      id: menuConfig.content
    })
  }
  return ''
}
