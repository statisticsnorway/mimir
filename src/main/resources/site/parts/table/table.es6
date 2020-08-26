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
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')

const moment = require('moment/min/moment-with-locales')
const view = resolve('./table.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req) {
  const page = getContent()
  const siteConfig = getSiteConfig()

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const dataSource = page.data.dataSource
  const datasetRepo = getDataset(page)
  let tableTitle

  if (dataSource && dataSource._selected === 'tbprocessor') {
    if (datasetRepo) {
      const metadata = datasetRepo.data.tbml.metadata
      tableTitle = metadata.title.content ? metadata.title.content : metadata.title
    } else {
      tableTitle = 'Ingen tabell knyttet til innhold'
    }
  }

  const standardSymbol = getStandardSymbolPage(siteConfig.standardSymbolPage, phrases.tableStandardSymbols)

  const model = {
    tableTitle,
    standardSymbol
  }

  const body = render(view, model)

  return {
    body,
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
