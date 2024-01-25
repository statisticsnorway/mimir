import { getComponent } from '/lib/xp/portal'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { isEnabled } from '/lib/featureToggle'
import { getStatbankApiData, type SimpleStatbankResult } from '/lib/ssb/parts/simpleStatbank'

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
  if (!isEnabled('simple-statbank-part', false, 'ssb')) return { body: '' }

  const part = getComponent<XP.PartComponent.SimpleStatbank>()

  if (!part) throw Error('No part found')

  const statbankApiData: SimpleStatbankResult | undefined = getStatbankApiData(
    part.config.code,
    part.config.urlOrId,
    part.config.json
  )

  const props = {
    icon: getImageUrl(part.config.icon),
    ingress: part.config.ingress,
    placeholder: part.config.placeholder ?? '',
    altText: getImageAltText(part.config.icon),
    resultLayout: part.config.resultText,
    selectDisplay: part.config.selectDisplay,
    statbankApiData,
  }

  return render('site/parts/simpleStatbank/simpleStatbank', props, req, {
    body: '<section class="xp-part"></section>',
  })
}
