import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import * as klass from '/lib/klass'
import * as glossary from '/lib/glossary'
import * as languageLib from '/lib/language'
import { alertsForContext } from '/lib/utils'
import * as municipals from '/lib/municipals'

const version = '%%VERSION%%'
const partsWithPreview = [ // Parts that has preview
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

  page.glossary = glossary.process(page)

  // Create preview if available
  let preview
  if (partsWithPreview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    if (controller.preview) {
      preview = controller.preview(req, page._id)
    }
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  if (!page._path.endsWith(req.path.split('/').pop()) && req.mode != 'edit' ) {
    breadcrumbs.push({ 'displayName': municipality.name })
  }

  const alerts = alertsForContext(municipality)

  const stylesUrl = portal.assetUrl({
    path: 'css/styles.css',
    params: {
      ts
    }
  })

  const jsLibsUrl = portal.assetUrl({
    path: 'js/libs.js',
    params: {
      ts
    }
  })

  const language = languageLib.getLanguage(page)
  let alternateLanguageVersionUrl;
  if (language.exists) {
    alternateLanguageVersionUrl = portal.pageUrl({
      path: language.path
    })
  }

  const model = {
    version,
    config,
    page,
    breadcrumbs,
    mainRegion,
    alerts,
    mode,
    preview,
    stylesUrl,
    jsLibsUrl,
    language,
    alternateLanguageVersionUrl
  }

  const body = thymeleaf.render(view, model)

  return { body }
}
