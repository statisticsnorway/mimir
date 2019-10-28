// import * as http from '/lib/http-client'
import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as glossary from '/lib/glossary'
import * as language from '/lib/language'


const test = resolve('/site/includes/ssb-menu.html')

// const foo = Document.createDocumentFragment(test)
// const hmm = foo.getElementById('header')

log.info(test)


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

  page.language = language.getLanguage(page)
  page.glossary = glossary.process(page)

  // Create preview
  if (page.type === `${app.name}:accordion` || page.type === `${app.name}:menu-box` || page.type === `${app.name}:button` ||
      page.type === `${app.name}:highchart` || page.type === `${app.name}:glossary` || page.type === `${app.name}:statistikkbanken` ||
      page.type === `${app.name}:dashboard` || page.type === `${app.name}:key-figure`) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    page.preview = controller.get({ config: { [name]: [page._id] }})
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const model = {test, version, ts, config, page, breadcrumbs, mainRegion }
  const body = thymeleaf.render(view, model)

  return { body }
}
