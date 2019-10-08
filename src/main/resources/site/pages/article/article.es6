const moment = require('/lib/moment-with-locales')

import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

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
  const config = {}
  const view = resolve('article.html')

  page.language = language.getLanguage(page)

  // Create preview
  if (page.type === `${app.name}:accordion` || page.type === `${app.name}:menu-box` || page.type === `${app.name}:button` || page.type === `${app.name}:highchart`) {
    const name = page.type.replace(/^.*:/, '')
    const controller = require(`../../parts/${name}/${name}`)
    page.preview = controller.get({ config: { [name]: [page._id] }})
  }

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(portal.pageUrl({ type: 'absolute', id: page._id }))

  const model = { version, ts, config, page, breadcrumbs, mainRegion, publishedDatetime, modifiedDatetime }
  const body = thymeleaf.render(view, model)

  return { body }
}
