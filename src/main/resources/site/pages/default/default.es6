const moment = require('/lib/moment-with-locales')

// import * as http from '/lib/http-client'
import * as content from '/lib/xp/content'
import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

import * as glossary from '/lib/glossary'
import * as language from '/lib/language'

import * as sb from '/lib/statistikkbanken'

const version = '%%VERSION%%'

function testing() {
  log.info(testing)
  const result = content.query({ count: 999, contentTypes: [`${app.name}:statistikkbanken`] })
  if (result) {
    for (const row of result.hits) {
log.info(JSON.stringify(row.data.table, null, ' '))
      if (row.data.table.match(/^http/)) {
        const data = sb.get(row.data.table, JSON.parse(row.data.json))
        if (data) {
          const dataset = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: '_id DESC', query: `data.query = '${row._id}'` })
// log.info(JSON.stringify(data, null, ' '))
log.info(JSON.stringify(dataset, null, ' '))
          if (dataset.count) {
            // Update dataset
log.info('-- update dataset --')
            const record = dataset.hits[0]
            const update = content.modify({ key: record._id, editor: (r) => {
              const updated = moment().format('DD.MM.YYYY HH:MM:SS')
              r.displayName = `${row.displayName} (datasett) oppdatert ${updated}`
              r.data.table =  row.data.table
              r.data.json = JSON.stringify(data, null, ' ')
              return r
            }})
            update || log.error(`UPDATE failed: ${record._path}`)
          }
          else {
            // Create dataset
log.info('-- create dataset --')
            const created = moment().format('DD.MM.YYYY HH:MM:SS')
            const name = `${row.displayName} (datasett) opprettet ${created}`
            const create = content.create({ name, parentPath: row._path, contentType: `${app.name}:dataset`, data: {
              table: row.data.table,
              query: row._id,
              json: JSON.stringify(data, null, ' ')
            }})
            create || log.error(`CREATE failed: ${name} [${row._path}]`)
          }
        }
      }
    }
  }
}

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

  // testing()

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

  const model = { version, ts, config, page, breadcrumbs, mainRegion }
  const body = thymeleaf.render(view, model)

  return { body }
}
