const moment = require('/lib/moment-with-locales')

import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./dashboard.html')
  const dashboard = []
  const dataset = {}

  const result = content.query({ count: 999, contentTypes: [`${app.name}:dataset`] })

  result && result.hits.map((set) => {
    dataset[set.data.dataquery] = set
  })

  const dataquery = content.query({ count: 999, contentTypes: [`${app.name}:dataquery`], sort: 'displayName' })
  dataquery && dataquery.hits.map((set) => {
    set.hasData = dataset[set._id] ? true : false
    set.class = set.hasData ? 'dataset-ok' : 'dataset-missing'
    if (set.hasData) {
      set.updated = moment(dataset[set._id].modifiedTime).format('DD.MM.YYYY HH:mm:ss')
      set.updatedHumanReadable = moment(dataset[set._id].modifiedTime).fromNow()
    }
  })

  // log.info(JSON.stringify(dataset, null, ' '))

  part.config.dashboard = part.config.dashboard && util.data.forceArray(part.config.dashboard) || []
  part.config.dashboard.map((key) => {
    const item = content.get({ key })
    dashboard.push(item)
  })

  const model = { part, dashboard, dataquery }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
