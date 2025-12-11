import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { assetUrl } from '/lib/enonic/asset'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'

import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { type StatbankBoxProps } from '/lib/types/partTypes/statbankBox'
import { type Statistics } from '/site/content-types'
import { type StatbankBox as StatbankBoxPartConfig } from '.'

const STATBANKWEB_URL: string =
  app.config && app.config['ssb.statbankweb.baseUrl']
    ? app.config['ssb.statbankweb.baseUrl']
    : 'https://www.ssb.no/statbank'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')
  const config = getComponent<XP.PartComponent.StatbankBox>()?.config
  if (!config) throw Error('No part found')

  const phrases = getPhrases(page) as Phrases

  return renderStatbankBox(req, parseStatbankBoxContent(page, config, phrases))
}

function renderStatbankBox(req: Request, statbankBoxContent: StatbankBoxProps): Response {
  return render(
    'StatbankBox',
    {
      ...statbankBoxContent,
    },
    req,
    {
      body: '<section class="xp-part part-statbank-box"></section>',
      hydrate: false,
    }
  )
}

function parseStatbankBoxContent(
  page: Content<Statistics>,
  config: StatbankBoxPartConfig,
  phrases: Phrases
): StatbankBoxProps {
  const statistic: StatisticInListing | undefined = (page.data.statistic &&
    getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing | undefined
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined

  const overrideTitle: string | undefined = config.title
  const fullWidth: boolean = config.fullWidthCheckBox
  let title: string | undefined
  if (overrideTitle) {
    title = overrideTitle
  } else if (fullWidth) {
    title = phrases['statbankBox.alt.title']
  } else {
    title = phrases['statbankBox.title']
  }

  const overrideUrl: string | undefined = config.href
  let href: string | undefined
  if (overrideUrl) {
    href = overrideUrl
  } else if (shortName) {
    href = `${STATBANKWEB_URL}/list/${shortName}`
  } else {
    href = `${STATBANKWEB_URL}/`
  }

  if (!overrideUrl && page.language === 'en') {
    href = href.replace('/statbank/', '/en/statbank/')
  }

  return {
    title,
    href: href,
    icon: assetUrl({
      path: 'SSB_ikon_statbank.svg',
    }),
    fullWidth,
  }
}
