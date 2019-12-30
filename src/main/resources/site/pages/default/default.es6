import * as content from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import * as glossary from '/lib/glossary'
import * as language from '/lib/language'
import { alertsForContext, pageMode } from '/lib/ssb/utils'
import { getMunicipality } from '/lib/klass/municipalities'

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

const view = resolve('default.html')

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}

  const mode = pageMode(req, page)

  page.language = language.getLanguage(page)
  page.glossary = glossary.process(page)

  // Create preview if available
  if (preview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    if (controller.preview) {
      page.preview = controller.preview(req, page._id)
    }
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const municipality = getMunicipality(req)
  if (!page._path.endsWith(req.path.split('/').pop()) && req.mode != 'edit' ) {
    breadcrumbs.push({ 'displayName': municipality.displayName })
  }

  const alerts = alertsForContext(municipality);

  const model = {
    version,
    ts,
    config,
    page,
    breadcrumbs,
    mainRegion,
    alerts,
    mode
  }

  const body = thymeleaf.render(view, model)

  return { body }
}
