import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import * as klass from '/lib/klass'

import * as glossary from '/lib/glossary'
import * as language from '/lib/language'

const version = '%%VERSION%%'
const preview = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menu-box`,
  `${app.name}:glossary`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:dashboard`,
  `${app.name}:key-figure`,
  `${app.name}:menu-dropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`
]

function getBreadcrumbs(c, a) {
  const key = c._path.replace(/\/[^\/]+$/, '')
  c = key && content.get({ key })
  c && c.type.match(/:page$/) && a.unshift(c) && getBreadcrumbs(c, a)
}

exports.get = function(req) {
  const parent = portal.getContent()

  const ts = new Date().getTime()
  const page = parent // || TODO: add child
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}
  const view = resolve('default.html')

  page.language = language.getLanguage(page)
  const glossaryContent = glossary.process(page)

  // Create preview if available
  if (preview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    page.preview = controller.get({ config: { [name]: [page._id] }})
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  if (!page._path.endsWith(req.path.split('/').pop()) && req.mode != 'edit' ) {
    breadcrumbs.push({ 'displayName': klass.getMunicipality(req).name })
  }

  const model = { version, ts, config, page, glossary: glossaryContent, breadcrumbs, mainRegion }
  const body = thymeleaf.render(view, model)

  return { body }
}
