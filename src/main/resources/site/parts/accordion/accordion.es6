const {
  getComponent,
  processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

// const view = resolve('./accordion.html')


exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()
  const accordionIds = part.config.accordion ? util.data.forceArray(part.config.accordion) : []

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

  const props = {
    accordions: accordions
  }
  return React4xp.render(part, props, req)
}
