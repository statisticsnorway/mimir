const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getContent, getComponent, imageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const content = __non_webpack_require__( '/lib/xp/content')
const {
  getSources
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')

import { Base64 } from 'js-base64'

const moment = require('moment/min/moment-with-locales')
const view = resolve('./infoGraphics.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const part = getComponent()
  const sourceConfig = part.config.sources ? data.forceArray(part.config.sources) : []

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const source = phrases.source
  const descriptionInfographics = phrases.descriptionInfographics

  // Encodes string to base64 and turns it into a dataURI
  const desc = Base64.encodeURI(part.config.longDesc)
  const longDesc = 'data:text/html;charset=utf-8;base64,' + desc

  const imageSrc = imageUrl({
    id: part.config.image,
    scale: 'max(850)'
  })

  // Retrieves image as content to get image meta data
  const imageData = content.get({
    key: part.config.image
  })

  // Retrieves the array where the sources are stored
  const sources = getSources(sourceConfig)

  const model = {
    title: part.config.title,
    altText: imageData.data.altText ? imageData.data.altText : imageData.data.caption,
    image: part.config.image,
    imageSrc: imageSrc,
    footnote: part.config.footNote,
    sources,
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
