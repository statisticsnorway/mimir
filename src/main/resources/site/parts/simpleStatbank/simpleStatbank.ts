import { getContent, getComponent } from '/lib/xp/portal'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { getStatbankApiData } from '/lib/ssb/parts/simpleStatbank'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type SimpleStatbankProps, type SimpleStatbankResult } from '/lib/types/partTypes/simpleStatbank'
import { type SimpleStatbank } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<SimpleStatbank>>()
  if (!page) throw Error('No page found')

  if (req.mode === 'edit' || req.mode === 'inline') {
    return renderSimpleStatbankComponent(req, page)
  } else {
    return fromPartCache(req, `${page._id}-simpleStatbank`, () => {
      return renderSimpleStatbankComponent(req, page)
    })
  }
}

function missingConfig(message: string) {
  return `<div class="simple-statbank"><div class='content'>${message}</div></div>`
}

function getImageUrl(icon?: string) {
  return icon
    ? imageUrl({
        id: icon,
        scale: 'block(100,100)',
        format: 'jpg',
      })
    : ''
}

function getImageAltText(icon?: string) {
  return icon ? getImageAlt(icon) : 'No description found'
}

function renderSimpleStatbankComponent(req: XP.Request, content: Content<SimpleStatbank> | null): XP.Response {
  let simpleStatbank
  if (content?.type === `${app.name}:simpleStatbank`) {
    simpleStatbank = content // Use page.data config instead when rendering part preview for content type
  } else {
    const config = getComponent<XP.PartComponent.SimpleStatbank>()?.config
    if (!config) throw Error('No part found')

    const simpleStatbankId: string | undefined = config?.simpleStatbank

    if (!simpleStatbankId) {
      return {
        body: missingConfig('Mangler innhold! Velg Spørring Statistikkbanken'),
      }
    }

    simpleStatbank = getContentByKey({
      key: simpleStatbankId as string,
    }) as Content<SimpleStatbank>

    if (!simpleStatbank) throw Error('No content found')
  }

  const statbankApiData: SimpleStatbankResult | undefined = getStatbankApiData(
    simpleStatbank.data.code,
    simpleStatbank.data.urlOrId,
    simpleStatbank.data.json
  )

  const props: SimpleStatbankProps = {
    icon: getImageUrl(simpleStatbank.data.icon),
    altText: getImageAltText(simpleStatbank.data.icon),
    title: simpleStatbank.data.simpleStatbankTitle,
    ingress: simpleStatbank.data.ingress ?? '',
    labelDropdown: simpleStatbank.data.labelDropdown,
    placeholderDropdown: simpleStatbank.data.placeholderDropdown ?? '',
    displayDropdown: simpleStatbank.data.displayDropdown ?? '',
    resultText: simpleStatbank.data.resultText,
    lowerCaseVariableFirstLetter: simpleStatbank.data.lowerCaseVariableFirstLetter,
    unit: simpleStatbank.data.unit ?? '',
    timeLabel: simpleStatbank.data.timeLabel,
    resultFooter: simpleStatbank.data.resultFooter ?? '',
    noNumberText: localize({
      key: 'value.notFound',
    }),
    closeText: localize({
      key: 'close',
    }),
    dataFetchFailedError: localize({
      key: 'dataFetchFailedError',
    }),
    statbankApiData,
  }

  return render('site/parts/simpleStatbank/simpleStatbank', props, req, {
    body: '<section class="xp-part simple-statbank"></section>',
  })
}
