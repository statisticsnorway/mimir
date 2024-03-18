import { getComponent } from '/lib/xp/portal'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { isEnabled } from '/lib/featureToggle'
import { getStatbankApiData, type SimpleStatbankResult } from '/lib/ssb/parts/simpleStatbank'
import { type SimpleStatbank } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.SimpleStatbank>()?.config
    if (!config) throw Error('No part found')

    const simpleStatbankId: string | undefined = config.simpleStatbank ? config.simpleStatbank : undefined
    return renderPart(req, simpleStatbankId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string): XP.Response {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
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

function missingConfig(message: string) {
  return `<div class="simple-statbank"><div class='content'>${message}</div></div>`
}

function renderPart(req: XP.Request, simpleStatbankId?: string): XP.Response {
  if (!isEnabled('simple-statbank-part', false, 'ssb')) return { body: '' }
  if (!simpleStatbankId) {
    return {
      body: missingConfig('Mangler innhold! Velg Spørring Statistikkbanken'),
    }
  }

  const simpleStatbank: Content<SimpleStatbank> | null = getContentByKey({
    key: simpleStatbankId as string,
  }) as Content<SimpleStatbank>

  if (!simpleStatbank) throw Error('No content found')

  const statbankApiData: SimpleStatbankResult | undefined = getStatbankApiData(
    simpleStatbank.data.code,
    simpleStatbank.data.urlOrId,
    simpleStatbank.data.json
  )

  const props = {
    icon: getImageUrl(simpleStatbank.data.icon),
    altText: getImageAltText(simpleStatbank.data.icon),
    title: simpleStatbank.data.simpleStatbankTitle,
    ingress: simpleStatbank.data.ingress,
    labelDropdown: simpleStatbank.data.labelDropdown,
    placeholderDropdown: simpleStatbank.data.placeholderDropdown,
    resultText: simpleStatbank.data.resultText,
    unit: simpleStatbank.data.unit,
    timeLabel: simpleStatbank.data.timeLabel,
    resultFooter: simpleStatbank.data.resultFooter,
    noNumberText: localize({
      key: 'value.notFound',
    }),
    closeText: localize({
      key: 'close',
    }),
    statbankApiData,
  }

  return render('site/parts/simpleStatbank/simpleStatbank', props, req)
}
