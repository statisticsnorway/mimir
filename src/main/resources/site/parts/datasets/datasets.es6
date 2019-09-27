const portal = require('/lib/xp/portal')
const util = require('/lib/util')
const contentLib = require('/lib/xp/content')
const thymeleaf = require('/lib/thymeleaf')
const moment = require('/lib/moment-with-locales')

exports.get = function(req) {
  moment.locale('nb')
  const view = resolve('./datasets.html')
  const datasets = contentLib.getChildren({ key: portal.getContent()._path }) || { hits: {}}
  datasets.hits = datasets.hits && util.data.forceArray(datasets.hits) || []

  datasets.hits.map((dataset) => {
    dataset.href = portal.pageUrl({id: dataset._id})
    const excelFiles = contentLib.query({count: 1, sort: 'modifiedTime DESC', query: `_path LIKE '/content${dataset._path}/*' AND _name LIKE '*.xlsx' `})
    if (excelFiles.hits.length > 0) {
      dataset.excelFileHref = portal.attachmentUrl({id: excelFiles.hits[0]._id})
      dataset.excelFileHrefLabel = excelFiles.hits[0].displayName
      dataset.excelFileModifiedDate = moment(excelFiles.hits[0].modifiedTime).format('DD.MM.YY')
      dataset.excelFileDatetime = moment(excelFiles.hits[0].modifiedTime).format('YYYY-MM-DD')
    }
  })

  // log.info(JSON.stringify(datasets, null, ' '))

  const model = { datasets }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
