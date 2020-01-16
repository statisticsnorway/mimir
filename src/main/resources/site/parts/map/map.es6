const { pageMode } = __non_webpack_require__('/lib/ssb/utils')
const portal = __non_webpack_require__('/lib/xp/portal')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')

const view = resolve('./map.html')

exports.get = function(req) {
  return renderPart(req)
}

exports.preview = function(req, id) {
  return renderPart(req)
}

function renderPart(req) {
  const page = portal.getContent()
  const mode = pageMode(req, page)
  const siteConfig = portal.getSiteConfig();
  let mapFolder = '/mapdata'

  if (typeof siteConfig.kommunefakta !=='undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl = portal.assetUrl( {
    path: mapFolder
  })
  const dataServiceUrl = portal.serviceUrl({
    service: 'municipality'
  })
  const body = thymeleaf.render(view, {
    dataPathAssetUrl,
    dataServiceUrl,
    isMunicipality: mode === 'municipality'
  })
  return { body, contentType: 'text/html' }
}
