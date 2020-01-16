const { data } = __non_webpack_require__( '/lib/util')
const { parseJsonStatToLabelValue } = __non_webpack_require__( '/lib/ssb/dataset')
const { getComponent } = __non_webpack_require__( '/lib/xp/portal')
const { render } = __non_webpack_require__( '/lib/thymeleaf')
const dataquery = __non_webpack_require__( '/lib/dataquery')
const { get: getDataQuery } = __non_webpack_require__( '/lib/ssb/dataquery')

const view = resolve('./dataquery.html')


exports.get = function(req) {
  const part = getComponent()
  const dataQueryIds = part.config.dataquery && data.forceArray(part.config.dataquery) || []
  return renderPart(req, dataQueryIds)
}
exports.preview = (req, id) => renderPart(req, [id])

const renderPart = (req, dataQueryIds) => {
  const dataQueries = dataQueryIds.map((key) => getDataQuery({ key }))
  const parsedDataQueries = dataQueries.filter((dq) => dq.data.table).map( (dq) => {
    const dataResult = dataquery.get(dq.data.table, dq.data.json && JSON.parse(dq.data.json))
    const contentsCode = dataResult && dataResult.dataset && Object.keys(dataResult.dataset.dimension.ContentsCode.category.index)[0]

    return {
      result: dataResult,
      table: parseJsonStatToLabelValue(dataResult.dataset),
      time: dataResult && dataResult.dataset && Object.keys(dataResult.dataset.dimension.Tid.category.index)[0],
      label: contentsCode && dataResult.dataset.dimension.ContentsCode.category.label[contentsCode]
    }
  })

  return {
    body: render(view, { dataqueries: parsedDataQueries }),
    contentType: 'text/html'
  }
}
