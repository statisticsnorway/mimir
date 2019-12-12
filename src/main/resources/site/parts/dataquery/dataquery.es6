const util = __non_webpack_require__( '/lib/util')
const portal = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const dataquery = __non_webpack_require__( '/lib/dataquery')

const view = resolve('./dataquery.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const dataQueryIds = part.config.dataquery && util.data.forceArray(part.config.dataquery) || []
  return renderPart(req, dataQueryIds);
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, dataQueryIds) {
  const dataqueries = []
  dataQueryIds.forEach((key) => {
    const api = content.get({ key })
    if (api.data.table) {
      api.result = dataquery.get(api.data.table, api.data.json && JSON.parse(api.data.json))
      api.table = getTable(api.result.dataset)
      api.time = api.result && api.result.dataset && Object.keys(api.result.dataset.dimension.Tid.category.index)[0]
      const contentsCode = api.result && api.result.dataset && Object.keys(api.result.dataset.dimension.ContentsCode.category.index)[0]
      api.label = contentsCode && api.result.dataset.dimension.ContentsCode.category.label[contentsCode]
    }
    dataqueries.push(api)
  })

  const model = { dataqueries }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}

function getTable(data, table = []) {
  if (data) {
    const dimension = data.dimension['KOKkommuneregion0000'] ? 'KOKkommuneregion0000' : Object.keys(data.dimension)[0]
    for (const key in data.dimension[dimension].category.label) {
      if (data.dimension[dimension].category.label.hasOwnProperty(key)) {
        const i = data.dimension[dimension].category.index[key]
        table.push({ label: data.dimension[dimension].category.label[key], value: data.value[i] })
      }
    }
  }
  return table
}
