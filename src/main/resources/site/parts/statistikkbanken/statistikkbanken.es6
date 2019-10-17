import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

import * as sb from '/lib/statistikkbanken'

function getTable(data, table = []) {
  for (const key in data.dimension.Region.category.label) {
    if (data.dimension.Region.category.label.hasOwnProperty(key)) {
       const i = data.dimension.Region.category.index[key]
       table.push({ label: data.dimension.Region.category.label[key], value: data.value[i] })
    }
  }
  return table
}

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./statistikkbanken.html')
  const statistikkbanken = []

  part.config.statistikkbanken = part.config.statistikkbanken && util.data.forceArray(part.config.statistikkbanken) || []
  part.config.statistikkbanken.map((key) => {
     const api = content.get({ key })
     if (api.data.table && api.data.json) {
       api.result = sb.get(api.data.table, JSON.parse(api.data.json))
       api.table = getTable(api.result.dataset)
     }
     statistikkbanken.push(api)
  })

  const model = { part, statistikkbanken }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
