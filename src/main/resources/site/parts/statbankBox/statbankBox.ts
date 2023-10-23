import type { Content } from '/lib/xp/content'
import type { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import type { Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import type { Statistics } from '/site/content-types'
import type { StatbankBox as StatbankBoxPartConfig } from '.'
import { getComponent, getContent, assetUrl } from '/lib/xp/portal'

const { getStatisticByIdFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const STATBANKWEB_URL: string =
  app.config && app.config['ssb.statbankweb.baseUrl']
    ? app.config['ssb.statbankweb.baseUrl']
    : 'https://www.ssb.no/statbank'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')
  const config = getComponent<XP.PartComponent.StatbankBox>()?.config
  if (!config) throw Error('No part found')

  const phrases: Phrases = getPhrases(page)

  return renderStatbankBox(req, parseStatbankBoxContent(page, config, phrases))
}

function renderStatbankBox(req: XP.Request, statbankBoxContent: StatbankBoxProps): XP.Response {
  return render(
    'StatbankBox',
    {
      ...statbankBoxContent,
    },
    req,
    {
      body: '<section class="xp-part part-statbank-box"></section>',
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

interface StatbankBoxProps {
  title: string
  href: string
  icon: string
  fullWidth: boolean
}
