const numeral = require('/lib/numeral')

import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'
import * as dataquery from '/lib/dataquery'
import * as klass from '/lib/klass'
import * as language from '/lib/language'

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

  const municipality = klass.getMunicipality(req)

  part.config.figure = util.data.forceArray(part.config.figure || part.config['key-figure'] || [])
  part.config.figure.map((key) => {
    const item = content.get({ key })
    if (!item) {
      return
    }
    item.data.glossary && page.glossary.push(content.get({ key: item.data.glossary }))
    if (item.data.dataquery) {
      const selection = { filter: 'item', values: [municipality && municipality.code || item.data.default] }
      const query = content.get({ key: item.data.dataquery })
      const dataset = content.query({ count: 1, contentTypes: [`${app.name}:dataset`], sort: 'createdTime DESC', query: `data.dataquery = '${query._id}'` })
      if (dataset && dataset.count) {
        // Use saved dataset
        const data = JSON.parse(dataset.hits[0].data.json)
        const table = getTable(data.dataset)
        item.value = (table[municipality && municipality.code || item.data.default] || { value: '-'}).value
        const time = data && Object.keys(data.dataset.dimension.Tid.category.index)[0]
        item.time = language.localizeTimePeriod(time)
      } else {
        // Use direct lookup
        const result = dataquery.get(query.data.table, JSON.parse(query.data.json), selection)
        item.value = result.dataset.value[0]
        const time = result && Object.keys(result.dataset.dimension.Tid.category.index)[0]
        item.time = language.localizeTimePeriod(time)
      }
      item.valueHumanReadable = item.value && (item.value > 999 ? numeral(item.value).format('0,0').replace(/,/, '&thinsp;') : item.value.toString().replace(/\./, ','))
    }
    (part.data || (part.data = [])).push(item)
  })

  const model = { page, part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
