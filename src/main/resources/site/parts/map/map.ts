import { ResourceKey, render } from '/lib/thymeleaf'

const { assetUrl, getSiteConfig, serviceUrl } = __non_webpack_require__('/lib/xp/portal')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view: ResourceKey = resolve('./map.html')

exports.get = function (req: XP.Request): XP.Response {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (): XP.Response => renderPart()

function renderPart(): XP.Response {
  const siteConfig: XP.SiteConfig = getSiteConfig()
  let mapFolder = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl: string = assetUrl({
    path: mapFolder,
  })
  const dataServiceUrl: string = serviceUrl({
    service: 'municipality',
  })
  const body: string = render(view, {
    dataPathAssetUrl,
    dataServiceUrl,
  })

  return {
    body,
    contentType: 'text/html',
  }
}
