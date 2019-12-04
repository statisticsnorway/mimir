import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

import * as sb from '/lib/statistikkbanken'

function getTable(data, table = []) {
  const dimension = data.dimension['KOKkommuneregion0000'] ? 'KOKkommuneregion0000' : Object.keys(data.dimension)[0]
  for (const key in data.dimension[dimension].category.label) {
    if (data.dimension[dimension].category.label.hasOwnProperty(key)) {
      const i = data.dimension[dimension].category.index[key]
      table.push({ label: data.dimension[dimension].category.label[key], value: data.value[i] })
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
      api.time = api.result && Object.keys(api.result.dataset.dimension.Tid.category.index)[0]
      const contentsCode = api.result && Object.keys(api.result.dataset.dimension.ContentsCode.category.index)[0]
      api.label = contentsCode && api.result.dataset.dimension.ContentsCode.category.label[contentsCode]
    }
    statistikkbanken.push(api)
  })

  const model = { part, statistikkbanken }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
