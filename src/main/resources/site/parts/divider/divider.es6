const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  v4: uuidv4
} = require('uuid')

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
      .setId('dividerId')

    body = divider.renderBody({
      body: render(view)
    })

    // Cache dividers
    if (dividerColor === 'dark') {
      darkBody = body
    } else {
      lightBody = body
    }
  }

  // UD: Replaces the generic id with a unique one to prevent duplicates
  body = body.replace(/id=\"dividerId\"/, 'id="' + uuidv4() + '"')

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

