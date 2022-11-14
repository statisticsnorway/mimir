import { getComponent, imageUrl, Component } from '/lib/xp/portal'
import { FrontPageBannerPartConfig } from './frontPageBanner-part-config'
import { render } from '/lib/thymeleaf'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const view = resolve('./frontPageBanner.html')

exports.get = function (req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
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
