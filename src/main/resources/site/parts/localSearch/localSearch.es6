const {
  getContent,
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
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
  const parentItem = part.config.searchFolder
  const 

  const props = {
    title: part.config.title,
    placeholder: part.config.searchPlaceholder
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

