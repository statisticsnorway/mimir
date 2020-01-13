const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')

const view = resolve('./related-kostra.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const municipality = getMunicipality(req)

  const config = part.config
  const title = config.title
  const description = config.description
  const btnTxt = config.btnTxt
  const btnLink = config.btnLink + (municipality == null ? '' : municipality)

  const model = { part, title, description, btnTxt, btnLink, municipality }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
