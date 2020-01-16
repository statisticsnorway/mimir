const { getComponent, getSiteConfig, getContent } = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./relatedKostra.html')

exports.get = function(req) {
  let municiaplity = getMunicipality(req)
  const page = getContent()
  const mode = pageMode(req, page)
  if (!municiaplity && mode === 'edit') {
    const defaultMuniciaplity = getSiteConfig().defaultMunicipality;
    municiaplity = getMunicipality({ code: defaultMuniciaplity })
  }
  return renderPart(req, municiaplity);
}

exports.preview = function(req) {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality;
  const municiaplity = getMunicipality({ code: defaultMuniciaplity })
  return renderPart(req, municiaplity)
}

function renderPart(req, municipality) {
  const part = getComponent()
  const model = {
    title: part.config.title,
    description: part.config.description,
    kostraLinkText: part.config.kostraLinkText,
    kostraLink: getHref(municipality, part.config.kostraLink)
  }

  const body = thymeleaf.render(view, model)

  return municipality !== undefined ? { body, contentType: 'text/html' } : ''
}

function getHref(municipality, kostraLink) {
  if(municipality !== undefined) {
    return kostraLink + (municipality.path == null ? '' : municipality.path)
  }
  return kostraLink
}

