const portal = __non_webpack_require__('/lib/xp/portal')
const util = __non_webpack_require__('/lib/util')
const contentLib = __non_webpack_require__('/lib/xp/content')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')
const moment = require('moment/min/moment-with-locales')

const view = resolve('./datasets.html')

exports.get = function(req) {
  moment.locale('nb')
  const datasets = contentLib.getChildren({
    key: portal.getContent()._path,
    count: 9999
  }) || {
    hits: {}
  }
  datasets.hits = datasets.hits && util.data.forceArray(datasets.hits) || []

  datasets.hits.map((dataset) => {
    dataset.href = portal.pageUrl({
      id: dataset._id
    })
    const excelFiles = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${dataset._path}/*' AND (_name LIKE '*.xlsx' OR _name LIKE '*.xlsm')`
    })
    if (excelFiles.hits.length > 0) {
      dataset.excelFileHref = portal.attachmentUrl({
        id: excelFiles.hits[0]._id
      })
      dataset.excelFileHrefLabel = excelFiles.hits[0].displayName
      dataset.excelFileModifiedDate = moment(excelFiles.hits[0].modifiedTime).format('DD.MM.YY')
      dataset.excelFileDatetime = moment(excelFiles.hits[0].modifiedTime).format('YYYY-MM-DD')
    }
  })

  const model = {
    datasets
  }
  const body = thymeleaf.render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
