import { getComponent, serviceUrl } from '/lib/xp/portal'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function getImageUrl(icon?: string) {
  return !!icon
    ? imageUrl({
      id: icon,
      scale: 'block(100,100)',
      format: 'jpg',
    })
    : null
}

function getImageAltText(icon?: string) {
  return !!icon ? getImageAlt(icon) : 'No description found'
}

function renderPart(req: XP.Request): XP.Response {
  const part = getComponent<XP.PartComponent.SingleQuery>()
  if (!part) throw Error('No part found')

  const singleQueryServiceUrl: string = serviceUrl({
    service: 'singleQuery',
  })

  const props = {
    icon: getImageUrl(part.config.icon),
    ingress: part.config.ingress,
    placeholder: part.config.placeholder ?? '',
    code: part.config.code,
    altText: getImageAltText(part.config.icon),
    table: part.config.table,
    query: part.config.json,
    resultLayout: part.config.body,
    singleQueryServiceUrl,
  }

  return render('SingleQuery', props, req, {
    body: '<section class="xp-part"></section>',
  })
}
