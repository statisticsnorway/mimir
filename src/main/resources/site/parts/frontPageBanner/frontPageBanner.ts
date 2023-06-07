import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { imageUrl } from '/lib/ssb/utils/imageUtils'
import type { FrontPageBanner as FrontPageBannerPartConfig } from '.'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view = resolve('./frontPageBanner.html')

export function get(req: XP.Request) {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview() {
  return renderPart()
}

function renderPart(): XP.Response {
  const part = getComponent<FrontPageBannerPartConfig>()
  if (!part) throw Error('No part found')

  const model: object = {
    bannerText: part.config.text,
    bannerImage: part.config.image
      ? imageUrl({
          id: part.config.image,
          scale: 'block(86,86)',
          format: 'jpg',
        })
      : undefined,
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html',
  }
}
