const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./glossary.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const glossaryIds = part.config.glossary ? util.data.forceArray(part.config.glossary) : []
    return renderPart(req, glossaryIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, glossaryIds) {
  const glossaries = []

  glossaryIds.forEach((key) => {
    const glossary = content.get({
      key
    })
    if (glossary) {
      glossaries.push({
        displayName: glossary.displayName,
        text: glossary.data.text
      })
    }
  })

  const body = render(view, {
    glossaries
  })

  return {
    body,
    contentType: 'text/html'
  }
}
