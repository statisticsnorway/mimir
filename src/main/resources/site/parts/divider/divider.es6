const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./divider.html')

let darkBody
let lightBody

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const component = getComponent()
  const dividerColor = component.config.dividerColor
  let body
  if (dividerColor === 'dark' && darkBody) {
    body = darkBody
  } else if (dividerColor !== 'dark' && lightBody) {
    body = lightBody
  } else {
    const divider = new React4xp('Divider').uniqueId()

    setColor(dividerColor, divider)

    const preRenderedBody = render(view, {
      dividerId: divider.react4xpId
    })

    body = divider.renderBody({
      body: preRenderedBody
    })

    if (dividerColor === 'dark') {
      darkBody = body
    } else {
      lightBody = body
    }
  }

  return {
    body
  }
}

function setColor(dividerColor, divider) {
  if (dividerColor === 'dark') {
    return divider.setProps({
      dark: true
    })
  } else {
    return divider.setProps({
      light: true
    })
  }
}
