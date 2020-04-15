const {
  data
} = __non_webpack_require__('/lib/util')
const {
  attachmentUrl,
  getContent,
  pageUrl,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
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

const view = resolve('./variableCardList.html')

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

  const variableCardListContent = contentLib.getChildren({
    key: getContent()._path,
    count: 9999
  }) || {
    hits: {}
  }
  variableCardListContent.hits = variableCardListContent.hits && data.forceArray(variableCardListContent.hits) || []

  const variableCardListHits = getVariableListContent(variableCardListContent)

  return variableCardListHits.length ? renderVariableCardList(variableCardListHits) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderVariableCardList(variableCardListHits) {
  const download = i18nLib.localize({
    key: 'variableCardList.download'
  })

  const variableCardsList = new React4xp('Datasets')
    .setProps({
      dataset: variableCardListHits.map((variableCardList) => {
        return {
          className: 'd-flex flex-column',
          title: variableCardList.title,
          description: variableCardList.description,
          fileLocation: variableCardList.excelFileHref,
          downloadText: download + ' (' + 'per ' + variableCardList.excelFileModifiedDate + ')',
          href: variableCardList.href,
          profiled: true
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    variableCardListId: variableCardsList.react4xpId
  })

  return {
    body: variableCardsList.renderBody({
      body
    }),
    pageContributions: variableCardsList.renderPageContributions(),
    contentType: 'text/html'
  }
}

function getVariableListContent(variableCardListContent) {
  return variableCardListContent.hits.map((variableCardList) => {
    variableCardList.href = pageUrl({
      id: variableCardList._id
    })

    const excelFiles = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${variableCardList._path}/*' AND (_name LIKE '*.xlsx' OR _name LIKE '*.xlsm')`
    })

    if (excelFiles.hits.length > 0) {
      variableCardList.excelFileHref = attachmentUrl({
        id: excelFiles.hits[0]._id
      })
      variableCardList.excelFileModifiedDate = moment(excelFiles.hits[0].modifiedTime).format('DD.MM.YY')
    }

    return {
      title: variableCardList.displayName,
      description: processHtml({
        value: variableCardList.data.ingress
      }),
      href: variableCardList.href,
      excelFileHref: variableCardList.excelFileHref,
      excelFileModifiedDate: variableCardList.excelFileModifiedDate
    }
  })
}
