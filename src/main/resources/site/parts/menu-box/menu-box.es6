const portal = require('/lib/xp/portal')
const util = require('/lib/util')
const content = require('/lib/xp/content')
const thymeleaf = require('/lib/thymeleaf')

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./menu-box.html')

  part.config.menu = part.config.menu || part.config['menu-box'] // Trick for preview
  part.menu = part.config.menu && content.get({ key: part.config.menu }) || { data: {}}
  part.menu.data.menu = part.menu.data.menu && util.data.forceArray(part.menu.data.menu) || []

  part.menu.data.menu.map((menu) => {
    if (menu.link) {
      menu.href = menu.link
    }
    else if (menu.content) {
      menu.href = portal.pageUrl({ id: menu.content })
    }
  })

// log.info(JSON.stringify(part, null, ' '))

  const model = { part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
