const {
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getChildren
} = __non_webpack_require__('/lib/xp/content')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./localSearch.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(request) {
  const part = getComponent()
  const items = getChildren({
    key: part.config.searchFolder,
    start: 0,
    count: 1000,
    sort: 'displayName ASC'
  }).hits.map((item) => {
    return {
      title: item.data.serialNumber ? item.displayName + ' (' + item.data.serialNumber + ')' : item.displayName,
      id: item._id,
      url: pageUrl({
        id: item._id
      })
    }
  })

  const props = {
    title: part.config.title,
    placeholder: part.config.searchPlaceholder,
    items: items
  }

  const localSearch = new React4xp('site/parts/localSearch/localSearch')
    .setProps(props)
    .setId('local-search')
    .uniqueId()

  const body = render(view, {
    localSearchId: localSearch.react4xpId
  })

  return {
    body: localSearch.renderBody({
      body
    }),
    pageContributions: localSearch.renderPageContributions()
  }
}

