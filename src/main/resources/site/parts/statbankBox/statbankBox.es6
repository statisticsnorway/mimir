const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  getContent,
  assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const view = resolve('./statbankBox.html')
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

  const title = phrases['statbankBox.title']
  let href = shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL
  if (page.language === 'en') {
    href = href.replace('/statbank/', '/en/statbank/')
  }

  const model = {
    statbankIcon: assetUrl({
      path: 'SSB_ikon_statbank.svg'
    }),
    title: title,
    href
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
