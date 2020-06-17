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
  let statbankHref = 'https://www.ssb.no/statbank'
  if (shortName) {
    statbankHref = statbankHref + '/list/' + shortName
  }

  const title = i18nLib.localize({
    key: 'statbankBox.title'
  })

  const model = {
    statbankIcon: assetUrl({
      path: 'icon-statbank.svg'
    }),
    title: title,
    href: statbankHref
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
