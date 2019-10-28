const moment = require('/lib/moment-with-locales')

import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'
import * as task from '/lib/xp/task'

// import * as sb from '/lib/statistikkbanken'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./dashboard.html')
  const dashboard = []
  const dataset = {}

  const result = content.query({ count: 999, contentTypes: [`${app.name}:dataset`] })

  result && result.hits.map((set) => {
    dataset[set.data.query] = set
  })

  const statistikkbank = content.query({ count: 999, contentTypes: [`${app.name}:statistikkbanken`], sort: 'displayName' })
  statistikkbank && statistikkbank.hits.map((set) => {
    set.hasData = dataset[set._id] ? true : false
    set.class = set.hasData ? 'dataset-ok' : 'dataset-missing'
    if (set.hasData) {
      set.updated = moment(dataset[set._id].modifiedTime).format('DD.MM.YYYY HH:mm:ss')
      set.updatedHumanReadable = moment(dataset[set._id].modifiedTime).fromNow()
    }
  })

// log.info(JSON.stringify(dataset, null, ' '))
// log.info(JSON.stringify(statistikkbank, null, ' '))

  part.config.dashboard = part.config.dashboard && util.data.forceArray(part.config.dashboard) || []
  part.config.dashboard.map((key) => {
     const item = content.get({ key })
     dashboard.push(item)
  })

  const model = { part, dashboard, statistikkbank }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
