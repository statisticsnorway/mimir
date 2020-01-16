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

  const preRenderedBody = thymeleaf.render(view, { divider })

  return {
    body: divider.renderBody({
      body: preRenderedBody
    })
  }

}

function setColor(dividerColor, divider) {
  if(dividerColor === 'dark') {
    return divider.setProps({ dark: true })
  } else {
    return divider.setProps({ light: true })
  }
}
