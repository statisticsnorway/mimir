const {
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  // getChildren
  get,
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()

  const searchFolderContent = get({
    key: part.config.searchFolder
  })

  const filteredItems = query({
    start: 0,
    count: 1000,
    sort: 'displayName ASC',
    query: `_parentPath LIKE "/content${searchFolderContent._path}"`,
    contentTypes: [
      `${app.name}:statistics`,
      `${app.name}:article`,
      `${app.name}:page`
    ]
  }).hits

  const items = filteredItems.map((item) => {
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
    items
  }

  return React4xp.render('site/parts/localSearch/localSearch', props, req, {
    clientRender: req.mode !== 'edit'
  })
}

