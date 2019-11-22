import * as content from '/lib/xp/content'
import * as context from '/lib/xp/context'
import * as klass from '/lib/klass'

const cron = require('/lib/cron')
const user = { login: 'su', userStore: 'system' }
const draft = { repository: 'com.enonic.cms.default', branch: 'draft', principals: ['role:system.admin'], user } // Draft context (XP)
const master = { repository: 'com.enonic.cms.default', branch: 'master', principals: ['role:system.admin'], user } // Master context (XP)
const moment = require('/lib/moment-with-locales')

log.info('Application ' + app.name + ' started') // Log application started
__.disposer(() => log.info('Application ' + app.name + ' stopped')) // Log application stoppped

function job() {
  log.info('-- Running datquery cron job  --')
  const result = content.query({ count: 999, contentTypes: [`${app.name}:dataquery`], query: `data.table LIKE 'http*'` })
  result && result.hits.map((row) => {
    const data = klass.get(row.data.table, row.data.json && JSON.parse(row.data.json))
    data && context.run(draft, () => {
      const now = moment().format('DD.MM.YYYY HH:mm:ss')
      const datasets = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: 'createdTime DESC', query: `data.dataquery = '${row._id}'` })
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
          publish || log.error(`PUBLISH failed: ${datasets.hits[0]._path}`)
        }
      }
      else { // Create dataset
        const name = `${row._name} (datasett) opprettet ${now}`
        const displayName = `${row.displayName} (datasett) opprettet ${now}`
        const create = content.create({ name, displayName, parentPath: row._path, contentType: `${app.name}:dataset`, data: {
          table: row.data.table,
          dataquery: row._id,
          json: JSON.stringify(data, null, ' ')
        }})
        create || log.error(`CREATE failed: ${name} [${row._path}]`)
        if (create) {
          log.debug(JSON.stringify(create, null, ' '))
          const publish = content.publish({ keys: [create._id], sourceBranch: 'draft', targetBranch: 'master', includeDependencies: false })
          publish || log.error(`PUBLISH failed: ${name} [${row._path}]`)
        }
      }
    })
  })
}

cron.schedule({ name: 'dataquery', cron: '0 8 * * *', times: 365 * 10, callback: job, context: master })

exports.job = job
