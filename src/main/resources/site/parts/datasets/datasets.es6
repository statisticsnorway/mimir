const {
  data
} = __non_webpack_require__('/lib/util')
const {
  attachmentUrl,
  getComponent,
  imageUrl,
  getContent,
  pageUrl,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getImageCaption
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const contentLib = __non_webpack_require__('/lib/xp/content')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const moment = require('moment/min/moment-with-locales')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

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

  const part = getComponent()
  const datasetConfig = part.config.datasetItemSet ? data.forceArray(part.config.datasetItemSet) : []

  return datasetConfig.length ? renderDatasets(datasetConfig) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderDatasets(datasetConfig) {
  const download = i18nLib.localize({
    key: 'download'
  })

  const modified = i18nLib.localize({
    key: 'modified'
  })

  const datasets = new React4xp('Datasets')
    .setProps({
      dataset: datasetConfig.map((dataset) => {
        return {
          className: 'd-flex flex-column',
          title: dataset.title,
          description: processHtml({
            value: dataset.description
          }),
          fileLocation: './not a file', /* TODO: Replace later; retrieve document from Content Studio */
          downloadText: download + ' (' + modified + ' )', /* TODO: Replace later; retrieve date from Content Studio */
          icon: dataset.icon ? imageUrl({
            id: dataset.icon,
            scale: 'block(100,100)'
          }) : undefined,
          iconAltText: dataset.icon ? getImageCaption(dataset.icon) : undefined,
          href: 'https://notalink', /* TODO: Replace later; retrieve link from Content Studio */
          profiled: true
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    datasetsId: datasets.react4xpId
  })

  return {
    body: datasets.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: datasets.renderPageContributions({
      clientRender: true
    })
  }
}
