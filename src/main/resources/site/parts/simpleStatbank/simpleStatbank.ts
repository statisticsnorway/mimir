import { type Request, type Response } from '@enonic-types/core'
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

export function get(req: Request): Response {
  try {
    const config = getComponent<XP.PartComponent.SimpleStatbank>()?.config
    if (!config) throw Error('No part found')

    const simpleStatbankId: string | undefined = config?.simpleStatbank
    return renderPart(req, simpleStatbankId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request, simpleStatbankId: string | undefined): Response {
  try {
    return renderPart(req, simpleStatbankId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function missingConfig(message: string) {
  return `<div class="simple-statbank"><div class='content'>${message}</div></div>`
}

function renderPart(req: Request, simpleStatbankId: string | undefined): Response {
  const page = getContent<Content<SimpleStatbank>>()
  if (!page) throw Error('No page found')

  let simpleStatbankData
  if (page.type === `${app.name}:simpleStatbank`) {
    simpleStatbankData = page // Fetch page.data config instead when rendering part preview for content type
  } else {
    if (!simpleStatbankId) {
      return {
        body: missingConfig('Mangler innhold! Velg Spørring Statistikkbanken'),
      }
    }
    simpleStatbankData = getContentByKey({
      key: simpleStatbankId as string,
    }) as Content<SimpleStatbank>
  }

  if (!simpleStatbankData) throw Error('No content found')

  let statbankApiData
  if (req.mode === 'edit' || req.mode === 'inline') {
    statbankApiData = getStatbankApiData(
      simpleStatbankData.data.code,
      simpleStatbankData.data.urlOrId,
      simpleStatbankData.data.json
    )
  } else {
    statbankApiData = fromPartCache(req, `${simpleStatbankId}-simpleStatbank`, () => {
      return getStatbankApiData(
        simpleStatbankData.data.code,
        simpleStatbankData.data.urlOrId,
        simpleStatbankData.data.json
      )
    })
  }

  return renderSimpleStatbankComponent(req, simpleStatbankData, statbankApiData)
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
  return getImageAlt(icon) ?? 'No description found'
}

function renderSimpleStatbankComponent(
  req: Request,
  simpleStatbankData: Content<SimpleStatbank>,
  statbankApiData: SimpleStatbankResult | undefined
): Response {
  const props: SimpleStatbankProps = {
    icon: getImageUrl(simpleStatbankData.data.icon),
    altText: getImageAltText(simpleStatbankData.data.icon),
    title: simpleStatbankData.data.simpleStatbankTitle,
    ingress: simpleStatbankData.data.ingress ?? '',
    labelDropdown: simpleStatbankData.data.labelDropdown,
    placeholderDropdown: simpleStatbankData.data.placeholderDropdown ?? '',
    displayDropdown: simpleStatbankData.data.displayDropdown ?? '',
    resultText: simpleStatbankData.data.resultText,
    lowerCaseVariableFirstLetter: simpleStatbankData.data.lowerCaseVariableFirstLetter,
    unit: simpleStatbankData.data.unit ?? '',
    timeLabel: simpleStatbankData.data.timeLabel,
    resultFooter: simpleStatbankData.data.resultFooter ?? '',
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
