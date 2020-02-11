const portal = __non_webpack_require__('/lib/xp/portal')
const util = __non_webpack_require__('/lib/util')
const content = __non_webpack_require__('/lib/xp/content')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')

const view = resolve('./menu-box.html')

exports.get = function(req) {
  const part = portal.getComponent()
  return renderPart(req, part.config.menu)
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
  const model = {
    menus
  }
  const body = thymeleaf.render(view, model)

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
  const menus = []
  menuConfigs.forEach((menuConfig) => {
    let imageSrc = ''
    if (menuConfig.image) {
      imageSrc = portal.imageUrl({
        id: menuConfig.image,
        scale: 'block(400,400)'
      })
    }

    menus.push({
      title: menuConfig.title,
      subtitle: menuConfig.subtitle,
      href: getHref(menuConfig),
      hasImage: !!imageSrc,
      imageSrc
    })
  })
  return menus
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
    return portal.pageUrl({
      id: menuConfig.content
    })
  }
  return ''
}
