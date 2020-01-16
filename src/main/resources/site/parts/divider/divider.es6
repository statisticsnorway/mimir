const portal = __non_webpack_require__('/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')

const view = resolve('./divider.html')

exports.get = function() {
  return renderPart()
}

exports.preview = function() {
  return renderPart()
}

function renderPart() {
  const component = portal.getComponent()
  const dividerColor = component.config.dividerColor
  const divider = new React4xp('Divider')

  setColor(dividerColor, divider)

  const model = {
    dividerId: divider.react4xpId
  }

  const preRenderedBody = thymeleaf.render(view, model)

  return {
    body: divider.renderBody({
      body: preRenderedBody
    })
  }

}

function setColor(dividerColor, divider) {
  if(dividerColor === 'dark') {
    return divider.setProps({ dark: true, light: false })
  } else {
    return divider.setProps({ dark: false, light: true })
  }
}
