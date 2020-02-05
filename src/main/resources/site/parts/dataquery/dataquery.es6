/* eslint-disable new-cap */
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getTbmlData
} = __non_webpack_require__( '/lib/tbml/tbml')
const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const dataquery = __non_webpack_require__( '/lib/dataquery')
const content = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
import JsonStat from 'jsonstat-toolkit'

const view = resolve('./dataquery.html')


exports.get = function(req) {
  const part = getComponent()
  const dataQueryIds = part.config.dataquery && data.forceArray(part.config.dataquery) || []
  return renderPart(req, dataQueryIds)
}
exports.preview = (req, id) => renderPart(req, [id])

const renderPart = (req, dataQueryIds) => {
  const dataQueries = dataQueryIds.map((key) => content.get({
    key
  }))
  const parsedDataQueries = dataQueries.filter((dq) => dq.data.table).map((dq) => {
    let table = []
    let headers = []

    const datasetFormat = dq.data.datasetFormat
    if ((!datasetFormat || datasetFormat._selected === 'jsonStat')) {
      const dataResult = dataquery.get(dq.data.table, dq.data.json && JSON.parse(dq.data.json))
      const ds = JsonStat(dataResult).Dataset(0)
      const dimensions = ds.id.map(() => 0)
      const categories = ds.Dimension(0).Category()
      table = categories.map((category) => {
        dimensions[0] = category.index
        return {
          label: category.label,
          columns: [ds.Data(dimensions, false)]
        }
      })
      const timeLabel = ds.Dimension('Tid').Category(0).label
      const contentsCodeLabel = ds.Dimension('ContentsCode').Category(0).label
      headers = [contentsCodeLabel, timeLabel]
    } else if (datasetFormat._selected === 'tbml') {
      const dataResult = getTbmlData(dq.data.table)
      headers = util.data.forceArray(dataResult.tbml.presentation.table.thead.tr.th)
      headers.unshift('')
      table = util.data.forceArray(dataResult.tbml.presentation.table.tbody.tr).map((tr) => {
        return {
          label: tr.th,
          columns: tr.td
        }
      })
    }

    return {
      displayName: dq.displayName,
      table,
      headers
    }
  })

  return {
    body: render(view, {
      dataqueries: parsedDataQueries
    }),
    contentType: 'text/html'
  }
}
