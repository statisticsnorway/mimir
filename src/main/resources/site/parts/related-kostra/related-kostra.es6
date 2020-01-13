const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./related-kostra.html')

exports.get = function(req) {
  return renderPart(req)
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const mode = pageMode(req, page)
  const municipality = getMunicipality(req)

  const model = {
    title: part.config.title,
    description: part.config.description,
    btnTxt: part.config.btnTxt,
    btnLink: getHref(mode, municipality, part.config.btnLink)}

  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}

function getHref(mode, municipality, btnLink) {
  if(mode === 'municipality') {
    return btnLink += (municipality.path == null ? '' : municipality.path)
  }
  return btnLink
}

