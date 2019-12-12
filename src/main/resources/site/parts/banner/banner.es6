const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const municipals = __non_webpack_require__( '/lib/municipals')
const klass = __non_webpack_require__( '/lib/klass')
const view = resolve('./banner.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const municipality = klass.getMunicipality(req)
  const mode = municipals.mode(req, page)
  const model = { page, part, municipality, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
