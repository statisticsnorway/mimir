const numeral = require('/lib/numeral')

import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'
import * as sb from '/lib/statistikkbanken'

function getTable(data, table = {}) {
  const dimension = data.dimension['KOKkommuneregion0000'] ? 'KOKkommuneregion0000' : Object.keys(data.dimension)[0]
  for (const key in data.dimension[dimension].category.label) {
    if (data.dimension[dimension].category.label.hasOwnProperty(key)) {
       const i = data.dimension[dimension].category.index[key]
       table[key] = { label: data.dimension[dimension].category.label[key], value: data.value[i] }
    }
  }
  return table
}

exports.get = function(req) {
  const page = { glossary: [] }
  const part = portal.getComponent() || req
  const view = resolve('./key-figure.html')

  // TODO:
  // const name = req.path.replace(/^.*\//, '') // Extract name from path

  part.config.figure = util.data.forceArray(part.config.figure || part.config['key-figure'] || [])
  part.config.figure.map((key) => {
    const item = content.get({ key })
    if (!item) {
      return
    }
    item.data.glossary && page.glossary.push(content.get({ key: item.data.glossary }))
    if (item.data.query) {
      const selection = { filter: 'item', values: [item.data.default] }
      const query = content.get({ key: item.data.query })
      const dataset = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: 'createdTime DESC', query: `data.query = '${query._id}'` })
      if (dataset && dataset.count) {
        // Use saved dataset
        const data = JSON.parse(dataset.hits[0].data.json)
        const table = getTable(data.dataset)
        item.value = table[item.data.default].value
        const time = data && Object.keys(data.dataset.dimension.Tid.category.index)[0]
        item.time = time
      }
      else {
        // Use direct lookup
        const result = sb.get(query.data.table, JSON.parse(query.data.json), selection)
        item.value = result.dataset.value[0]
        const time = result && Object.keys(result.dataset.dimension.Tid.category.index)[0]
        item.time = time
      }
      item.valueHumanReadable = item.value && numeral(item.value).format('0,0').replace(/,/, '&thinsp;')
    }
    (part.data || (part.data = [])).push(item)
  })

  const model = { page, part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
