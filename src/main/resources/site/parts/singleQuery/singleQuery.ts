import { getComponent } from '/lib/xp/portal'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { isEnabled } from '/lib/featureToggle'

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
  return icon
    ? imageUrl({
        id: icon,
        scale: 'block(100,100)',
        format: 'jpg',
      })
    : null
}

function getImageAltText(icon?: string) {
  return icon ? getImageAlt(icon) : 'No description found'
}

function renderPart(req: XP.Request): XP.Response {
  if (!isEnabled('single-query-part', false, 'ssb')) return { body: '' }

  const part = getComponent<XP.PartComponent.SingleQuery>()
  if (!part) throw Error('No part found')

  // TODO: Legge inn logikk for å hente alle valgene for code (eks yrker)
  // og resultatet som skal vises (eks. gjennomsnittslønn) her i forkant i stedet

  const props = {
    icon: getImageUrl(part.config.icon),
    ingress: part.config.ingress,
    placeholder: part.config.placeholder ?? '',
    altText: getImageAltText(part.config.icon),
    resultLayout: part.config.body,
  }

  return render('SingleQuery', props, req, {
    body: '<section class="xp-part"></section>',
  })
}
