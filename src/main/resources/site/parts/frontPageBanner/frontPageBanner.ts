import { getComponent, imageUrl, Component } from '/lib/xp/portal'
import type { FrontPageBanner as FrontPageBannerPartConfig } from '.'
import { render } from '/lib/thymeleaf'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view = resolve('./frontPageBanner.html')

exports.get = function (req: XP.Request) {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = () => renderPart()

function renderPart(): XP.Response {
  const part: Component<FrontPageBannerPartConfig> = getComponent()

  const model: object = {
    bannerText: part.config.text,
    bannerImage: part.config.image
      ? imageUrl({
          id: part.config.image,
          scale: 'block(86,86)',
        })
      : undefined,
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html',
  }
}
