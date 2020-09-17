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
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./statbankLinkList.html')
const STATBANKWEB_URL = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'

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
  const title = i18nLib.localize({
    key: 'statbankList.title'
  })
  const linkTitle = i18nLib.localize( {
    key: 'statbankList.linkTitle'
  })
  const linkTitleWithNumber = linkTitle + ' (' + page.data.linkNumber + ')'
  const statbankLinkHref = shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL

  if (!shortName || shortName.length === 0 || shortName === undefined) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view)
      }
    }
    return {
      body: null
    }
  }

  const model = {
    title: title,
    statbankLinks: page.data.statbankLinkItemSet
  }

  const statbankLinkComponent = new React4xp('StatbankLinkList')
    .setProps({
      href: statbankLinkHref,
      iconType: 'arrowRight',
      className: 'statbank-link',
      children: linkTitleWithNumber,
      linkType: 'profiled'
    })
    .setId('statbank-link')

  const body = render(view, model, {
    statbankLinkId: statbankLinkComponent.react4xpId
  })

  return {
    body: statbankLinkComponent.renderBody({
      body
    }),
    pageContributions: statbankLinkComponent.renderPageContributions(),
    contentType: 'text/html'
  }
}
