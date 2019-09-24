const portal = require('/lib/xp/portal')
const util = require('/lib/util')
const contentLib = require('/lib/xp/content')
const thymeleaf = require('/lib/thymeleaf')
const moment = require('/lib/moment-with-locales')

exports.get = function(req) {
  const view = resolve('./datasets.html')
  const datasets = contentLib.getChildren({ key: portal.getContent()._path }) || { hits: {}}
  datasets.hits = datasets.hits && util.data.forceArray(datasets.hits) || []

  datasets.hits.map((dataset) => {
    dataset.href = portal.pageUrl({id: dataset._id});
    const datasetAttachment = contentLib.getChildren({key: dataset._path}) || { hits: {}}
    datasetAttachment.hits = datasetAttachment.hits && util.data.forceArray(datasetAttachment.hits) || []
    const variabelliste = datasetAttachment.hits.filter(function(content) {
        return content.displayName.toLowerCase() == 'variabelliste'
    })
    if (variabelliste.length > 0) {
      moment.locale('nb')
      dataset.variabellisteHref = portal.attachmentUrl({id: variabelliste[0]._id});
      dataset.variabellisteModifiedDate = moment(variabelliste[0].modifiedTime).format('DD-MM-YYYY')
    }
  })

  // log.info(JSON.stringify(datasets, null, ' '))

  const model = { datasets }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
