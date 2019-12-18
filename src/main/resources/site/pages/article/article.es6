import * as klass from '../../../lib/klass';

const moment = require('/lib/moment-with-locales')

import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as glossary from '/lib/glossary'
import * as language from '/lib/language'
import { alertsForContext } from '/lib/utils'

const version = '%%VERSION%%'
const preview = [
  `${app.name}:accordion`,
  `${app.name}:menu-box`,
  `${app.name}:button`,
  `${app.name}:highchart`,
  `${app.name}:glossary`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dashboard`,
  `${app.name}:key-figure`
]

function getBreadcrumbs(c, a) {
  const key = c._path.replace(/\/[^\/]+$/, '')
  c = key && content.get({ key })
  c && c.type.match(/:page$/) && a.unshift(c) && getBreadcrumbs(c, a)
}

const view = resolve('article.html')

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = portal.getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const bottomRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.bottom
  const config = {}
  const municipality = klass.getMunicipality(req)

  page.language = language.getLanguage(page)
  page.glossary = glossary.process(page)

  // Create preview
  if (preview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    if (controller.preview) {
      page.preview = controller.preview(req, page._id)
    }
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(portal.pageUrl({ type: 'absolute', id: page._id }))

  const alerts = alertsForContext(municipality);

  const model = {
    version,
    ts,
    config,
    page,
    breadcrumbs,
    mainRegion,
    bottomRegion,
    publishedDatetime,
    modifiedDatetime,
    alerts
  }
  const body = thymeleaf.render(view, model)

  return { body }
}
