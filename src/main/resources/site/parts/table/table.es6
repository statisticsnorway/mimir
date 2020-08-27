const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  parseTable
} = __non_webpack_require__( '/lib/ssb/table')

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
  let tableTitle

  if (table && table.tbmlData) {
    tableTitle = table.tbmlData.tbml.metadata.title
  } else {
    tableTitle = 'Ingen tabell knyttet til innhold'
  }

  const tableReact = new React4xp('Table')
    .setProps({
      tableTitle: tableTitle,
      displayName: tableContent.displayName,
      thead: table.tbmlData.tbml.presentation.table.thead,
      tbody: table.tbmlData.tbml.presentation.table.tbody
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
