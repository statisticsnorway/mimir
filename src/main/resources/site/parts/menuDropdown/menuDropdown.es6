const {
  assetUrl,
  getContent,
  getComponent,
  pageUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  municipalsWithCounties,
  getMunicipality,
  removeCountyFromMunicipalityName
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

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

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
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
      id: component.config.basePage
    }) :
    pageUrl({
      id: page._id
    })

  const searchBarText = i18nLib.localize({
    key: 'menuDropdown.searchBarText'
  })

  const municipalityItems = parsedMunicipalities.map( (municipality) => ({
    id: municipality.path,
    title: municipality.displayName
  }))

  // Dropdown react object for sticky menu
  const dropdownComponent = new React4xp('site/parts/menuDropdown/DropdownMunicipality')
      .setProps({
        ariaLabel: searchBarText,
        placeholder: searchBarText,
        items: municipalityItems,
        baseUrl: baseUrl,
      })
      .setId('dropdownId')
      .uniqueId()

  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined

  const model = {
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalities: parsedMunicipalities,
    municipalityName: municipalityName,
    dropdownId: dropdownComponent.react4xpId
  }

  const thymeleafRender = render(view, model)

  const body = dropdownComponent.renderBody({
    body: thymeleafRender,
    clientRender: req.mode !== 'edit'
  })

  return {
    body,
    pageContributions: dropdownComponent.renderPageContributions(),
    contentType: 'text/html'
  }
}
