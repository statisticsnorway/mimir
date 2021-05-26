const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getContent,
  getComponent,
  assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')

const STATBANKWEB_URL = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
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
  const phrases = getPhrases(page)

  const isNotInEditMode = req.mode !== 'edit'
  return renderStatbankBox(parseStatbankBoxContent(page, part, phrases), isNotInEditMode)
}

const renderStatbankBox = (statbankBoxContent, isNotInEditMode) => {
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
      body,
      clientRender: isNotInEditMode
    }),
    pageContributions: statbankBoxComponent.renderPageContributions({
      clientRender: isNotInEditMode
    })
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
    title = phrases['statbankBox.alt.title']
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
    href = `${STATBANKWEB_URL}/`
  }

  if (!overrideUrl && page.language === 'en') {
    href = href.replace('/statbank/', '/en/statbank/')
  }

  return {
    title,
    href: href,
    icon: assetUrl({
      path: 'SSB_ikon_statbank.svg'
    }),
    fullWidth
  }
}
