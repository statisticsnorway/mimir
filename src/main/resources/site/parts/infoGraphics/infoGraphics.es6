const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getComponent, imageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')

import { Base64 } from 'js-base64'

const view = resolve('./infoGraphics.html')

exports.get = function(req) {
  try {
    return renderPart()
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart() {
  const part = getComponent()
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

  const imageSrc = imageUrl({
    id: part.config.image,
    scale: 'max(850)'
  })

  const model = {
    title: part.config.title,
    altText: part.config.altText,
    image: part.config.image,
    imageSrc: imageSrc,
    footnote: part.config.footNote,
    selectedSource,
    longDesc,
    source,
    descriptionInfographics
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
