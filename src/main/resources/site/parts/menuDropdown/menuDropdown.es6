const {
  assetUrl,
  getContent,
  getComponent,
  pageUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  municipalsWithCounties,
  getMunicipality,
  removeCountyFromMunicipalityName
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./menuDropdown.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const parsedMunicipalities = municipalsWithCounties()
  const municipality = getMunicipality(req)
  const component = getComponent()
  const siteConfig = getSiteConfig()
  let mapFolder = '/mapdata'

  if (typeof siteConfig.kommunefakta !=='undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl = assetUrl( {
    path: mapFolder
  })

  const dataServiceUrl = serviceUrl({
    service: 'municipality'
  })

  const page = getContent()
  const baseUrl = component.config.basePage ?
    pageUrl({
      id: component.config.basePage }) :
    pageUrl({
      id: page._id
    })

  const searchBarText = i18nLib.localize({
    key: 'menuDropdown.searchBarText'
  })

  // Input field react object for sticky menu
  const inputStickyMenu = new React4xp('Input')
    .setProps({
      id: 'input-query-municipality',
      ariaLabel: searchBarText,
      searchField: true,
      placeholder: searchBarText,
      baseUrl: baseUrl,
      municipalities: parsedMunicipalities,
      className: 'municipality-search'
    })
    .setId('inputStickyMenu')

  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined

  const model = {
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalities: parsedMunicipalities,
    municipalityName : municipalityName
  }

  const body = inputStickyMenu.renderBody({
    body: render(view, model)
  })

  return {
    body,
    contentType: 'text/html'
  }
}
