const {
  getContent,
  getComponent,
  pageUrl,
  serviceUrl,
  assetUrl,
  getSiteConfig
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  municipalsWithCounties, getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./menu-dropdown.html')

exports.get = (req) => renderPart(req)

exports.preview = (req, id) => renderPart(req)

function renderPart(req) {
  const parsedMunicipalities = municipalsWithCounties()
  const component = getComponent()
  const siteConfig = getSiteConfig();
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

  const model = {
    mode: pageMode(req, page),
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }
  
  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}
