import { Content } from '/lib/xp/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { Statistics } from '../../content-types/statistics/statistics'

const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const util = __non_webpack_require__('/lib/util')
const view: ResourceKey = resolve('./statbankLinkList.html')
const STATBANKWEB_URL: string = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

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

  const statbankLinkComponent: React4xpObject = new React4xp('StatbankLinkList')
    .setProps({
      href: statbankLinkHref,
      iconType: 'arrowRight',
      className: 'statbank-link',
      children: linkTitleWithNumber,
      linkType: 'profiled'
    })
    .setId('statbankLinkId')

  const body: string = render(view, model)

  return {
    body: statbankLinkComponent.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: statbankLinkComponent.renderPageContributions({
      clientRender: req.mode !== 'edit'
    }) as XP.PageContributions,
    contentType: 'text/html'
  }
}

interface StatbankLinkListModel {
  title: string;
  statbankLinks: Statistics['statbankLinkItemSet'];
}
