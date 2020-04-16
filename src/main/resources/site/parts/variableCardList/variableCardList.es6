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

  const children = contentLib.getChildren({
    key: getContent()._path,
    count: 9999
  })
  children.hits = children.hits && data.forceArray(children.hits) || []

  const content = getVariableListContent(children)

  return content.length ? renderVariableCardList(content) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderVariableCardList(content) {
  const download = i18nLib.localize({
    key: 'variableCardList.download'
  })

  const variableCardsList = new React4xp('Datasets')
    .setProps({
      dataset: content.map((variableCardList) => {
        return {
          title: variableCardList.title,
          description: variableCardList.description,
          fileLocation: variableCardList.excelFileHref,
          downloadText: download + ' (' + 'per ' + variableCardList.excelFileModifiedDate + ')',
          href: variableCardList.href
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

function getVariableListContent(children) {
  return children.hits.map((variableCardList) => {
    const excelFiles = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${variableCardList._path}/*' AND (_name LIKE '*.xlsx' OR _name LIKE '*.xlsm')`
    })

    let excelFileHref
    let excelFileModifiedDate

    if (excelFiles.hits.length > 0) {
      excelFileHref = attachmentUrl({
        id: excelFiles.hits[0]._id
      })
      excelFileModifiedDate = moment(excelFiles.hits[0].modifiedTime).format('DD.MM.YY')
    }

    return {
      title: variableCardList.displayName,
      description: processHtml({
        value: variableCardList.data.ingress
      }),
      href: pageUrl({
        id: variableCardList._id
      }),
      excelFileHref: excelFileHref,
      excelFileModifiedDate: excelFileModifiedDate
    }
  })
}
