const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getImageCaption
} = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./banner.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const pageType = part.config.pageType
  const factsAbout = i18nLib.localize({
    key: 'factsAbout'
  })

  const model = {
    pageDisplayName: page.displayName,
    bannerImageAltText: getImageCaption(part.config.image),
    bannerImage: part.config.image ? portal.imageUrl({ id: part.config.image, scale: 'block(1400,400)'}) : undefined,
    municipality: pageType._selected === 'kommunefakta' ? getMunicipality(req) : undefined,
    pageType,
    factsAbout
  }

  const body = thymeleaf.render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
