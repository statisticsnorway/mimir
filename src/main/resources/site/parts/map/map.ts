import { Request, Response } from 'enonic-types/controller'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { SiteConfig } from '../../site-config'

const {
  assetUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const view: ResourceKey = resolve('./map.html')

exports.get = function(req:Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req:Request): Response => renderPart(req)

function renderPart(req:Request): Response {
  const siteConfig:SiteConfig = getSiteConfig()
  let mapFolder: string = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl:string = assetUrl( {
    path: mapFolder
  })
  const dataServiceUrl:string = serviceUrl({
    service: 'municipality'
  })
  const body:string = render(view, {
    dataPathAssetUrl,
    dataServiceUrl
  })

  return {
    body,
    contentType: 'text/html'
  }
}
