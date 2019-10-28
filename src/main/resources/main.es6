import * as content from '/lib/xp/content'
import * as context from '/lib/xp/context'
import * as sb from '/lib/statistikkbanken'

const cron = require('/lib/cron')
const user = { login: 'su', userStore: 'system' }
const draft = { repository: 'com.enonic.cms.default', branch: 'draft', principals: ['role:system.admin'], user } // Draft context (XP)
const master = { repository: 'com.enonic.cms.default', branch: 'master', principals: ['role:system.admin'], user } // Master context (XP)
const moment = require('/lib/moment-with-locales')

log.info('Application ' + app.name + ' started') // Log application started
__.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

function statistikkbanken() {
  log.info('-- Running Statistikkbanken cron job  --')
  const result = content.query({ count: 999, contentTypes: [`${app.name}:statistikkbanken`], query: `data.table LIKE 'http*'` })
  result && result.hits.map((row) => {
    const data = sb.get(row.data.table, JSON.parse(row.data.json))
    data && context.run(draft, () => {
      const now = moment().format('DD.MM.YYYY HH:mm:ss')
      const datasets = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: 'createdTime DESC', query: `data.query = '${row._id}'` })
      if (datasets.count) { // Update dataset
        const update = content.modify({ key: datasets.hits[0]._id, editor: (r) => {
          r.displayName = `${row.displayName} (datasett) endret ${now}`
          r.data.table = row.data.table
          r.data.json = JSON.stringify(data, null, ' ')
          return r
        }})
        update || log.error(`UPDATE failed: ${datasets.hits[0]._path}`)
        if (update) {
          log.debug(JSON.stringify(update, null, ' '))
          const publish = content.publish({ keys: [update._id], sourceBranch: 'draft', targetBranch: 'master', includeDependencies: false })
log.info('-- publish update --')
log.info(JSON.stringify(publish, null, ' '))
        }
      }
      else { // Create dataset
        const name = `${row._name} (datasett) opprettet ${now}`
        const displayName = `${row.displayName} (datasett) opprettet ${now}`
        const create = content.create({ name, displayName, parentPath: row._path, contentType: `${app.name}:dataset`, data: {
          table: row.data.table,
          query: row._id,
          json: JSON.stringify(data, null, ' ')
        }})
        create || log.error(`CREATE failed: ${name} [${row._path}]`)
        if (create) {
          log.debug(JSON.stringify(create, null, ' '))
          const publish = content.publish({ keys: [create._id], sourceBranch: 'draft', targetBranch: 'master', includeDependencies: false })
        }
      }
    })
  })
}

cron.schedule({ name: 'statistikkbanken', cron: '0 8 * * *', times: 365 * 10, callback: statistikkbanken, context: master })

exports.statistikkbanken = statistikkbanken
