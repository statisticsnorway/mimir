const moment = require('/lib/moment-with-locales')

import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as glossary from '/lib/glossary'
import * as language from '/lib/language'

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
  const bottomRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.bottom
  const config = {}
  const view = resolve('article.html')

  page.language = language.getLanguage(page)
  page.glossary = glossary.process(page)

  // Create preview
  if (page.type === `${app.name}:accordion` || page.type === `${app.name}:menu-box` || page.type === `${app.name}:button` ||
      page.type === `${app.name}:highchart` || page.type === `${app.name}:glossary` || page.type === `${app.name}:statistikkbanken` ||
      page.type === `${app.name}:dashboard` || page.type === `${app.name}:key-figure`) {
    const controller = require(`../../parts/${name}/${name}`)
    page.preview = controller.get({ config: { [name]: [page._id] }})
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(portal.pageUrl({ type: 'absolute', id: page._id }))

  const model = { version, ts, config, page, breadcrumbs, mainRegion, bottomRegion, publishedDatetime, modifiedDatetime }
  const body = thymeleaf.render(view, model)

  return { body }
}
