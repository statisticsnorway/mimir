const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getComponent,
  imageUrl,
  imagePlaceholder
} = __non_webpack_require__('/lib/xp/portal')

const view = resolve('./pictureCardLinks.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req) {
  const part = getComponent()
  const pictureCardLinks = new React4xp('PictureCardLinks')
    .setProps({
      pictureCardLinks: parsePictureCardLinks(part.config.pictureCardLinks)
    })
    .uniqueId()

  const body = render(view, {
    pictureCardLinksId: pictureCardLinks.react4xpId
  })
  return {
    body: pictureCardLinks.renderBody({
      body
    }),
    pageContributions: pictureCardLinks.renderPageContributions()
  }
}

function parsePictureCardLinks(pictureCardLinks) {
  pictureCardLinks = Array.isArray(pictureCardLinks) ? pictureCardLinks : [pictureCardLinks]
  return pictureCardLinks.reduce((acc, pictureCardLink) => {
    if (pictureCardLink) {
      const title = pictureCardLink.title
      const subTitle = pictureCardLink.subTitle
      const href = pictureCardLink.href
      let imageSrc = ''
      let imageAlt = ' '
      if (pictureCardLink.image) {
        imageSrc = imageUrl({
          id: pictureCardLink.image,
          scale: 'block(580, 420)'
        })
        imageAlt = getImageAlt(pictureCardLink.image) || ' '
      } else {
        imageSrc = imagePlaceholder({
          width: 580,
          height: 420
        })
      }
      acc.push({
        title,
        subTitle,
        href,
        imageSrc,
        imageAlt
      })
    }
    return acc
  }, [])
}
