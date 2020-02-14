const {
  assetUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const view = resolve('./map.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    log.error(e)
    return renderError('Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
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
  const body = render(view, {
    dataPathAssetUrl,
    dataServiceUrl
  })
  return {
    body,
    contentType: 'text/html'
  }
}
