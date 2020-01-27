const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./infoGraphics.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const mode = pageMode(req, page)
  const model = { page, part, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
