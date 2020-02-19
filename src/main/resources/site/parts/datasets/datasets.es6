const {
  attachmentUrl,
  getContent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const contentLib = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const moment = require('moment/min/moment-with-locales')
const view = resolve('./datasets.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  moment.locale('nb')
  const datasets = contentLib.getChildren({
    key: getContent()._path,
    count: 9999
  }) || {
    hits: {}
  }
  datasets.hits = datasets.hits && util.data.forceArray(datasets.hits) || []

  datasets.hits.map((dataset) => {
    dataset.href = pageUrl({
      id: dataset._id
    })
    const excelFiles = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${dataset._path}/*' AND (_name LIKE '*.xlsx' OR _name LIKE '*.xlsm')`
    })
    if (excelFiles.hits.length > 0) {
      dataset.excelFileHref = attachmentUrl({
        id: excelFiles.hits[0]._id
      })
      dataset.excelFileHrefLabel = excelFiles.hits[0].displayName
      dataset.excelFileModifiedDate = moment(excelFiles.hits[0].modifiedTime).format('DD.MM.YY')
      dataset.excelFileDatetime = moment(excelFiles.hits[0].modifiedTime).format('YYYY-MM-DD')
    }
  })

  const body = render(view, {
    datasets
  })

  return {
    body,
    contentType: 'text/html'
  }
}
