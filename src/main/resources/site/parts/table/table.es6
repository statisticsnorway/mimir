const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent, getSiteConfig, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  parseTable
} = __non_webpack_require__( '/lib/ssb/table')

const moment = require('moment/min/moment-with-locales')
const view = resolve('./table.html')


exports.get = function(req) {
  try {
    const tableContent = getContent()
    return renderPart(req, tableContent)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req, tableContent) {
  const table = parseTable(req, tableContent)
  const siteConfig = getSiteConfig()

  moment.locale(tableContent.language ? tableContent.language : 'nb')
  const phrases = getPhrases(tableContent)

  let tableTitle

  if (table && table.tbmlData) {
    tableTitle = table.tbmlData.tbml.metadata.title
  } else {
    tableTitle = 'Ingen tabell knyttet til innhold'
  }

  const standardSymbol = getStandardSymbolPage(siteConfig.standardSymbolPage, phrases.tableStandardSymbols)

  const tableReact = new React4xp('Table')
    .setProps({
      tableTitle: tableTitle,
      displayName: tableContent.displayName,
      head: table.head,
      body: table.body,
      standardSymbol: standardSymbol
    })
    .uniqueId()

  const body = render(view, {
    tableId: tableReact.react4xpId
  })

  return {
    body: tableReact.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: tableReact.renderPageContributions({
      clientRender: true
    }),
    contentType: 'text/html'
  }
}

const getStandardSymbolPage = (standardSymbolPage, standardSymbolText) => {
  if (standardSymbolPage) {
    const standardSymbolHref = standardSymbolPage ? pageUrl({
      id: standardSymbolPage
    }) : ''

    return {
      href: standardSymbolHref,
      text: standardSymbolText
    }
  }
  return null
}
