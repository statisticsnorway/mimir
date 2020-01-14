const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

const view = resolve('./divider.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const dividerColorConfig = part.config.dividerColor
  return renderPart(req, dividerColorConfig)
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req, dividerColorConfig) {
  const dividerColor = (dividerColorConfig === 'dark') ? 'ssb-divider type-dark' : 'ssb-divider type-light'
  const body = thymeleaf.render(view, { dividerColor })
  return { body, contentType: 'text/html' }
}
