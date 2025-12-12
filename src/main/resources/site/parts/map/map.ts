import { type Request, type Response } from '@enonic-types/core'
import { getSiteConfig, serviceUrl } from '/lib/xp/portal'
import { assetUrl } from '/lib/enonic/asset'
import { render } from '/lib/thymeleaf'
import { scriptAsset } from '/lib/ssb/utils/utils'

import { renderError } from '/lib/ssb/error/error'

const view = resolve('./map.html')

export function get(req: Request): Response {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(): Response {
  return renderPart()
}

function renderPart(): Response {
  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

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
