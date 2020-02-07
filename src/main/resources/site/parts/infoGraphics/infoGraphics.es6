const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  data
} = __non_webpack_require__( '/lib/util')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

import { Base64 } from 'js-base64'

const view = resolve('./infoGraphics.html')

exports.get = function(req) {
  const page = portal.getContent()
  const part = portal.getComponent()
  const mode = pageMode(req, page)
  const selectedSource = data.forceArray(part.config.checkOptionSet)
  const source = i18nLib.localize({
    key: 'source'
  })
  const descriptionInfographics = i18nLib.localize({
    key: 'descriptionInfographics'
  })

  // Encodes string to base64 and turns it into a dataURI
  const desc = Base64.encodeURI(part.config.longDesc)
  const longDesc = 'data:text/html;charset=utf-8;base64,' + desc

  const model = {
    page,
    part,
    mode,
    selectedSource,
    longDesc,
    source,
    descriptionInfographics
  }
  const body = thymeleaf.render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
