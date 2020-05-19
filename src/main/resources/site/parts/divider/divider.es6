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
    const component = getComponent()
    return renderPart(req, component.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req, {
  dark: false
})

const renderPart = (req, config) => {
  const dividerColor = config.dividerColor

  let body
  if (dividerColor === 'dark' && darkBody) {
    body = darkBody
  } else if (dividerColor !== 'dark' && lightBody) {
    body = lightBody
  } else {
    const divider = new React4xp('Divider')
      .setProps(
        setColor(dividerColor)
      )
      .uniqueId()

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

const setColor = (dividerColor) => {
  if (dividerColor === 'dark') {
    return {
      dark: true
    }
  } else {
    return {
      light: true
    }
  }
}

