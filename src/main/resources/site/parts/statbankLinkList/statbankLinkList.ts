import type {Content} from '/lib/xp/content'
import {type ResourceKey, render} from '/lib/thymeleaf'
import type {StatisticInListing} from '../../../lib/ssb/dashboard/statreg/types'
import type {Phrases} from '../../../lib/types/language'
import {render as r4xpRender} from '/lib/enonic/react4xp'
import type {Statistics} from '../../content-types/statistics/statistics'
import {getContent} from '/lib/xp/portal'

const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const util = __non_webpack_require__('/lib/util')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const view: ResourceKey = resolve('./statbankLinkList.html')
const STATBANKWEB_URL: string = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'

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
  const page: Content<Statistics> = getContent()
  const statistic: StatisticInListing = (page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined
  const phrases: Phrases = getPhrases(page)

  const title: string = phrases['statbankList.title']
  const linkTitle: string = phrases['statbankList.linkTitle']

  const linkTitleWithNumber: string = `${linkTitle} (${page.data.linkNumber as string})`
  let statbankLinkHref: string = shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL
  if (page.language === 'en') {
    statbankLinkHref = statbankLinkHref.replace('/statbank/', '/en/statbank/')
  }
  const statbankLinkItemSet: Statistics['statbankLinkItemSet'] = page.data.statbankLinkItemSet

  if (!statbankLinkItemSet || statbankLinkItemSet.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          title: title
        })
      }
    }
    return {
      body: null
    }
  }

  const model: StatbankLinkListModel = {
    title: title,
    statbankLinks: util.data.forceArray(statbankLinkItemSet)
  }

  const body: string = render(view, model)

  return r4xpRender('StatbankLinkList',
    {
      href: statbankLinkHref,
      iconType: 'arrowRight',
      className: 'statbank-link',
      children: linkTitleWithNumber,
      linkType: 'profiled'
    },
    req,
    {
      id: 'statbankLinkId',
      body: body,
      clientRender: req.mode !== 'edit'
    })
}

interface StatbankLinkListModel {
  title: string;
  statbankLinks: Statistics['statbankLinkItemSet'];
}
