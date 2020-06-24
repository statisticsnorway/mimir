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
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./statbankBox.html')
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
  const shortName = page.data.shortName ? page.data.shortName : undefined
  const title = i18nLib.localize({
    key: 'statbankBox.title'
  })

  const model = {
    statbankIcon: assetUrl({
      path: 'SSB_ikon_statbank.svg'
    }),
    title: title,
    href: shortName ? `${STATBANKWEB_URL}/list/${shortName}` : STATBANKWEB_URL
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
