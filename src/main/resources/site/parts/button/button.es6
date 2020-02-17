const {
  attachmentUrl,
  getComponent,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./button.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const buttonsIds = part.config.button ? util.data.forceArray(part.config.button) : []
    return renderPart(req, buttonsIds)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, buttonIds) {
  const buttons = []

  buttonIds.map((key) => {
    const button = content.get({
      key
    })

    if (button && button.data.link) {
      const target = content.get({
        key: button.data.link
      })

      if (target) {
        const href = getHref(target)
        buttons.push({
          displayName: button.displayName,
          href
        })
      }
    }
  })

  const body = render(view, {
    buttons
  })

  return {
    body,
    contentType: 'text/html'
  }
}

/**
 * create a href link for the button based on target
 * @param {object} target content
 * @return {string}
 */
function getHref(target) {
  if (target.type === `${app.name}:page`) {
    return pageUrl({
      id: target._id
    })
  } else {
    return attachmentUrl({
      id: target._id
    })
  }
}
