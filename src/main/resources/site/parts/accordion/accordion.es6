const {
  getComponent,
  processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./accordion.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const accordionIds = part.config.accordion ? util.data.forceArray(part.config.accordion) : []
    return renderPart(req, accordionIds)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, accordionIds) {
  const accordions = []

  accordionIds.map((key) => {
    const accordion = content.get({
      key
    })

    if (accordion) {
      const items = accordion.data.items ? util.data.forceArray(accordion.data.items) : []
      accordions.push({
        id: accordion._id,
        body: processHtml({
          value: accordion.data.body
        }),
        open: accordion.data.open,
        items
      })
    }
  })

  const body = render(view, {
    accordions
  })

  return {
    body,
    contentType: 'text/html'
  }
}
