import { type ResourceKey, render } from '/lib/thymeleaf'
import { assetUrl, getSiteConfig, serviceUrl } from '/lib/xp/portal'
import { scriptAsset } from '/lib/ssb/utils/utils'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view: ResourceKey = resolve('./map.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(): XP.Response {
  return renderPart()
}

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
    pageContributions: {
      bodyEnd: [scriptAsset('js/map.js')],
    },
  }
}
