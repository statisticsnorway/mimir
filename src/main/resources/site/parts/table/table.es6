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
    const content = getContent()
    const table = parseTable(req, content)
    log.info('table PrettyJSON%s',JSON.stringify(table ,null,4));
    return renderPart(req, table)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req, table) {
  let tableTitle

  if (table) {
    tableTitle = table.tbmlData.tbml.metadata.title
  } else {
    tableTitle = 'Ingen tabell knyttet til innhold'
  }

  const tableReact = new React4xp('Table')
    .setProps({
      tableTitle: tableTitle
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
