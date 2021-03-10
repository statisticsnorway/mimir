const {
  getComponent,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getImageAlt
} = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./frontPageBanner.html')


exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const part = getComponent()

  const model = {
    bannerText: part.config.text,
    bannerImageAltText: getImageAlt(part.config.image),
    bannerImage: part.config.image ? imageUrl({
      id: part.config.image,
      scale: 'block(86,86)'
    }) : undefined
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
