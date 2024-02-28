import { type Content } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { type Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'

import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { renderError } from '/lib/ssb/error/error'
import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { StatbankLinkListModel } from '/lib/types/partTypes/statbankLinkList'
import { type Statistics } from '/site/content-types'

const STATBANKWEB_URL: string =
  app.config && app.config['ssb.statbankweb.baseUrl']
    ? app.config['ssb.statbankweb.baseUrl']
    : 'https://www.ssb.no/statbank'
const view = resolve('./statbankLinkList.html')

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

  const statistic: StatisticInListing = (page.data.statistic &&
    getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined
  const phrases = getPhrases(page) as Phrases

  const title: string = phrases['statbankList.title']
  const linkTitle: string = phrases['statbankList.linkTitle']

  const linkTitleWithNumber = `${linkTitle} (${page.data.linkNumber as string})`
  let statbankLinkHref: string = shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL
  if (page.language === 'en') {
    statbankLinkHref = statbankLinkHref.replace('/statbank/', '/en/statbank/')
  }
  const statbankLinkItemSet: Statistics['statbankLinkItemSet'] = page.data.statbankLinkItemSet

  if (!statbankLinkItemSet || statbankLinkItemSet.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          title: title,
        }),
      }
    }
    return {
      body: null,
    }
  }

  const model: StatbankLinkListModel = {
    title: title,
    statbankLinks: util.data.forceArray(statbankLinkItemSet),
  }

  const body: string = render(view, model)

  return r4xpRender(
    'StatbankLinkList',
    {
      href: statbankLinkHref,
      iconType: 'arrowRight',
      className: 'statbank-link',
      children: linkTitleWithNumber,
      linkType: 'profiled',
    },
    req,
    {
      id: 'statbankLinkId',
      body: body,
    }
  )
}
