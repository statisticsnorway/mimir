import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

import * as sb from '/lib/statistikkbanken'

const numeral = require('/lib/numeral')

exports.get = function(req) {
  const page = { glossary: [] }
  const part = portal.getComponent() || req
  const view = resolve('./key-figure.html')

  // TODO:
  // const name = req.path.replace(/^.*\//, '') // Extract name from path

  part.config.figure = util.data.forceArray(part.config.figure || part.config['key-figure'] || [])
  part.config.figure.map((key) => {
    const item = content.get({ key })
    item.data.glossary && page.glossary.push(content.get({ key: item.data.glossary }))
    if (item.data.query) {
      const selection = { filter: 'agg_single:KommNyeste', values: [item.data.default] }
      const query = content.get({ key: item.data.query })
      const result = sb.get(query.data.table, JSON.parse(query.data.json), selection)
      item.value = result.dataset.value[0]
      item.valueHumanReadable = result && numeral(item.value).format('0,0').replace(/,/, '&thinsp;')
      const time = result && Object.keys(result.dataset.dimension.Tid.category.index)[0]
      item.time = time
    }
    (part.data || (part.data = [])).push(item)
  })

  const model = { page, part }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
