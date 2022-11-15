import { type ResourceKey, render } from '/lib/thymeleaf'
import type { SiteConfig } from '../../site-config'
import { assetUrl, getSiteConfig, serviceUrl } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view: ResourceKey = resolve('./map.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const siteConfig: SiteConfig = getSiteConfig()
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
