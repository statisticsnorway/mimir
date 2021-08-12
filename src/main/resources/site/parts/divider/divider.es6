const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./divider.html')

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
  const dividerColor = config.dividerColor || 'light'

  const divider = new React4xp('Divider')
    .setProps(
      setColor(dividerColor)
    )
    .setId('dividerId')
    .uniqueId()

  const body = divider.renderBody({
    body: render(view, {
      dividerId: divider.react4xpId
    }),
    clientRender: req.mode !== 'edit'
  })
  const pageContributions = divider.renderPageContributions({
    clientRender: req.mode !== 'edit'
  })


  return {
    body,
    pageContributions
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

