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
  const divider = new React4xp('Divider')

  setColor(dividerColor, divider)

  const preRenderedBody = render(view, {
    divider
  })

  return {
    body: divider.renderBody({
      body: preRenderedBody
    })
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
