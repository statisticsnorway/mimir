// import * as http from '/lib/http-client'
import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

const version = '%%VERSION%%'

function getBreadcrumbs(c, a) {
  const key = c._path.replace(/\/[^\/]+$/, '')
  c = key && content.get({ key })
  c && c.type.match(/:page$/) && a.unshift(c) && getBreadcrumbs(c, a)
}

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = portal.getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}
  const view = resolve('default.html')

  const home = content.get({ key: '/ssb' })
  home.isHome = home._id === page._id
log.info(JSON.stringify(home, null, ' '))

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const model = { version, ts, home, config, page, breadcrumbs, mainRegion }
  const body = thymeleaf.render(view, model)

  return { body }
}
