const util = __non_webpack_require__( '/lib/util')
const portal = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

const view = resolve('./glossary.html')

exports.get = function(req) {
  const part = portal.getComponent();
  const glossaryIds = part.config.glossary ? util.data.forceArray(part.config.glossary) : []
  return renderPart(req, glossaryIds);
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, glossaryIds) {
  const glossaries = []

  glossaryIds.forEach((key) => {
    const glossary = content.get({ key })
    if (glossary) {
      glossaries.push({
        displayName: glossary.displayName,
        ingress: glossary.data.ingress
      })
    }
  })

  const model = { glossaries }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
