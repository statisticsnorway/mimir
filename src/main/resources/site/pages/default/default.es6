const content     = __non_webpack_require__( '/lib/xp/content')
const portal      = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf   = __non_webpack_require__( '/lib/thymeleaf')
const klass       = __non_webpack_require__( '/lib/klass')
const glossary    = __non_webpack_require__( '/lib/glossary')
const language    = __non_webpack_require__( '/lib/language')
const { alertsForContext } = __non_webpack_require__( '/lib/utils')
const municipals  = __non_webpack_require__( '/lib/municipals')

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
  const page = portal.getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}

  const mode = municipals.mode(req, page)
  const municipality = klass.getMunicipality(req)

  page.language = language.getLanguage(page)
  page.glossary = glossary.process(page)

  // Create preview if available
  if (preview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = __non_webpack_require__(`../../parts/${name}/${name}`)
    if (controller.preview) {
      page.preview = controller.preview(req, page._id)
    }
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  if (!page._path.endsWith(req.path.split('/').pop()) && req.mode != 'edit' ) {
    breadcrumbs.push({ 'displayName': municipality.name })
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
