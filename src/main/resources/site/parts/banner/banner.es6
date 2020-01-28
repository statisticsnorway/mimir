const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./banner.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const municipality = getMunicipality(req)
  const mode = pageMode(req, page)
  const pageType = part.config.pageType
  const factsAbout = i18nLib.localize({key: 'factsAbout'});

  const model = { page, part, municipality, pageType, factsAbout, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
