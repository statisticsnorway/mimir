const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  getContent,
  getComponent,
  assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')

const moment = require('moment/min/moment-with-locales')
const STATBANKWEB_URL = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'
const React4xp = require('/lib/enonic/react4xp')
const view = resolve('./statbankBox.html')

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
  const part = getComponent()

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  return renderStatbankBox(parseStatbankBoxContent(page, part, phrases))
}

const renderStatbankBox = (statbankBoxContent) => {
  const statbankBoxComponent = new React4xp('StatbankBox')
    .setProps({
      ...statbankBoxContent
    })
    .uniqueId()

  const body = render(view, {
    statbankBoxId: statbankBoxComponent.react4xpId
  })

  return {
    body: statbankBoxComponent.renderBody({
      body
    }),
    pageContributions: statbankBoxComponent.renderPageContributions(),
    clientRender: true
  }
}

const parseStatbankBoxContent = (page, part, phrases) => {
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)
  const shortName = statistic && statistic.shortName ? statistic.shortName : undefined

  const overrideTitle = part.config.title
  const fullWidth = part.config.fullWidthCheckBox
  let title
  if (overrideTitle) {
    title = overrideTitle
  } else if (fullWidth) {
    title = 'Statistikkbanken - alle tallene våre samlet på ett sted'
  } else {
    title = phrases['statbankBox.title']
  }

  const overrideUrl = part.config.href
  let href
  if (overrideUrl) {
    href = overrideUrl
  } else if (shortName) {
    href = `${STATBANKWEB_URL}/list/${shortName}`
  } else {
    href = STATBANKWEB_URL
  }

  if (!overrideUrl && page.language === 'en') {
    href = href.replace('/statbank/', '/en/statbank/')
  }

  return {
    title,
    href,
    icon: assetUrl({
      path: 'SSB_ikon_statbank.svg'
    }),
    fullWidth
  }
}
