const cron = require('/lib/cron')
const moment = require('/lib/moment-with-locales')

import * as content from '/lib/xp/content'
import * as context from '/lib/xp/context'

import * as sb from '/lib/statistikkbanken'

// Log application started
log.info('Application ' + app.name + ' started')

// Log when application is stopped
__.disposer(function() {
    log.info('Application ' + app.name + ' stopped');
})

// Draft context
const draft = {
  repository: 'com.enonic.cms.default',
  branch: 'draft',
  principals: ['role:system.admin'],
  user: { login: 'su', userStore: 'system' }
}

function statistikkbanken() {
  log.info('-- Running Statisikkbanken task --')
  const result = content.query({ count: 999, contentTypes: [`${app.name}:statistikkbanken`] })
  if (result) {
    for (const row of result.hits) {
      if (row.data.table.match(/^http/)) {
        const data = sb.get(row.data.table, JSON.parse(row.data.json))
        if (data) {
          const dataset = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: '_id DESC', query: `data.query = '${row._id}'` })
          const now = moment().format('DD.MM.YYYY HH:mm:ss')
          if (dataset.count) {
            // Update dataset
            context.run(draft, () => {
              const record = dataset.hits[0]
              const name = `${row.name} (datasett) endret ${now}`
              const displayName = `${row.displayName} (datasett) endret ${now}`
              const update = content.modify({ key: record._id, editor: (r) => {
                r.name = name
                r.displayName = displayName
                r.data.table = row.data.table
                r.data.json = JSON.stringify(data, null, ' ')
                return r
              }})
              update || log.error(`UPDATE failed: ${record._path}`)
              update && log.debug(JSON.stringify(update, null, ' '))
            })
          }
          else {
            // Create dataset
            const name = `${row.name} (datasett) opprettet ${now}`
            const displayName = `${row.displayName} (datasett) opprettet ${now}`
            context.run(draft, () => {
              const create = content.create({ name, displayName, parentPath: row._path, contentType: `${app.name}:dataset`, data: {
                table: row.data.table,
                query: row._id,
                json: JSON.stringify(data, null, ' ')
              }})
              create || log.error(`CREATE failed: ${name} [${row._path}]`)
              create && log.debug(JSON.stringify(create, null, ' '))
            })
          }
        }
      }
    }
  }
}


const task = cron.get({ name: 'myTask' })

cron.schedule({
  name: 'myTask',
  cron: '0 8 * * *',
  times: 365 * 10,
  callback: statistikkbanken,
  context: {
    repository: 'com.enonic.cms.default',
    branch: 'master',
    principals: ['role:system.admin'],
    user: { login: 'su', userStore: 'system' }
  }
})
