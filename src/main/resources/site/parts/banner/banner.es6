const {
  getContent,
  getComponent,
  imageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./banner.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    log.error(e)
    return renderError('Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const part = getComponent()
  const pageType = part.config.pageType
  const factsAbout = i18nLib.localize({
    key: 'factsAbout'
  })

  const model = {
    pageDisplayName: page.displayName,
    bannerImage: part.config.image ? imageUrl({
      id: part.config.image,
      scale: 'block(1400,400)'
    }) : undefined,
    municipality: pageType._selected === 'kommunefakta' ? getMunicipality(req) : undefined,
    pageType,
    factsAbout
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
