import { getStatisticByIdFromRepo } from '../../../lib/repo/statreg/statistics'

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const React4xp = require('/lib/enonic/react4xp')
const util = __non_webpack_require__('/lib/util')
const view = resolve('./statbankLinkList.html')
const STATBANKWEB_URL = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'

const moment = require('moment/min/moment-with-locales')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)
  const shortName = statistic && statistic.shortName ? statistic.shortName : undefined

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const title = phrases['statbankList.title']
  const linkTitle = phrases['statbankList.linkTitle']

  const linkTitleWithNumber = linkTitle + ' (' + page.data.linkNumber + ')'
  let statbankLinkHref = shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL
  if (page.language === 'en') {
    statbankLinkHref = statbankLinkHref.replace('/statbank/', '/en/statbank/')
  }
  const statbankLinkItemSet = page.data.statbankLinkItemSet

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

  const model = {
    title: title,
    statbankLinks: util.data.forceArray(statbankLinkItemSet)
  }

  const statbankLinkComponent = new React4xp('StatbankLinkList')
    .setProps({
      href: statbankLinkHref,
      iconType: 'arrowRight',
      className: 'statbank-link',
      children: linkTitleWithNumber,
      linkType: 'profiled'
    })
    .setId('statbankLinkId')

  const body = render(view, model)

  return {
    body: statbankLinkComponent.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: statbankLinkComponent.renderPageContributions({
      clientRender: req.mode !== 'edit'
    }),
    contentType: 'text/html'
  }
}
