const {
  getContent,
  getComponent,
  imageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  getMunicipality, removeCountyFromMunicipalityName
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getImageAlt
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./banner.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const part = getComponent()
  const pageType = part.config.pageType
  const factsAbout = i18nLib.localize({
    key: 'factsAbout'
  })
  const municipality = pageType._selected === 'kommunefakta' ? getMunicipality(req) : undefined
  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined

  const model = {
    pageDisplayName: page.displayName,
    bannerImageAltText: getImageAlt(part.config.image),
    bannerImage: part.config.image ? imageUrl({
      id: part.config.image,
      scale: 'block(1400,400)'
    }) : undefined,
    municipalityTitle: municipality ? municipalityName + ' (' + municipality.county.name + ')' : undefined,
    pageType,
    factsAbout
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
