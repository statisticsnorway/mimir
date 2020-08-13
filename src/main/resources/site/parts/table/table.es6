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
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')

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
  const dataSource = page.data.dataSource
  const datasetRepo = getDataset(page)
  let tableTitle

  if (dataSource && dataSource._selected === 'tbprocessor') {
    if (datasetRepo) {
      tableTitle = datasetRepo.data.tbml.metadata.title.content
    } else {
      tableTitle = 'Ingen tabell knyttet til innhold'
    }
  }


  const model = {
    title: page.displayName,
    tableTitle
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
