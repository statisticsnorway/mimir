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
const {
  getSources
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')

const moment = require('moment/min/moment-with-locales')
const view = resolve('./table.html')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

exports.get = function(req) {
  try {
    const tableId = getContent().data.mainTable

    return renderPart(req, tableId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, tableId) {
  const page = getContent()
  const tableLabel = i18nLib.localize({
    key: 'table'
  })

  if (!tableId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          label: tableLabel
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const tableContent = get({
    key: tableId
  })
  const table = parseTable(req, tableContent)
  const siteConfig = getSiteConfig()

  moment.locale(tableContent.language ? tableContent.language : 'nb')
  const phrases = getPhrases(tableContent)
  const language = page.language

  // sources
  const sourceConfig = tableContent.data.sources ? forceArray(tableContent.data.sources) : []
  const sourceLabel = phrases.source
  const sources = getSources(sourceConfig)

  const standardSymbol = getStandardSymbolPage(siteConfig.standardSymbolPage, phrases.tableStandardSymbols)

  const tableReact = new React4xp('Table')
    .setProps({
      downloadTableLabel: phrases.tableDownloadAs,
      downloadTableTitle: {
        title: phrases.tableDownloadAs
      },
      downloadTableOptions: getDownloadTableOptions(phrases),
      displayName: tableContent.displayName,
      table: {
        caption: table.caption,
        thead: table.thead,
        tbody: table.tbody,
        tfoot: table.tfoot,
        tableClass: table.tableClass,
        language: language,
        noteRefs: table.noteRefs
      },
      standardSymbol: standardSymbol,
      sources,
      sourceLabel
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

const getDownloadTableOptions = () => {
  const downloadTable = []

  const XLS = {
    title: '.xlsx (Excel)',
    id: 'downloadTableAsXLS'
  }
  downloadTable.push(XLS)

  const CSV = {
    title: '.CSV',
    id: 'downloadTableAsCSV'
  }
  downloadTable.push(CSV)

  return downloadTable
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
