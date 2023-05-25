import type { PictureCardLinks as PictureCardLinksPartConfig } from '.'
import { getComponent, imageUrl, imagePlaceholder } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

const { getImageAlt } = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const config: PictureCardLinksPartConfig = getComponent().config
  return render(
    'PictureCardLinks',
    {
      pictureCardLinks: parsePictureCardLinks(config.pictureCardLinks),
    },
    req,
    {
      body: '<section class="xp-part picture-card-links container my-5"></section>',
    }
  )
}

function parsePictureCardLinks(
  pictureCardLinks: PictureCardLinksPartConfig['pictureCardLinks']
): Array<PictureCardLinksContent> {
  pictureCardLinks = Array.isArray(pictureCardLinks) ? pictureCardLinks : [pictureCardLinks]
  return pictureCardLinks.reduce((acc, pictureCardLink, index) => {
    if (pictureCardLink) {
      const title: string = pictureCardLink.title
      const subTitle: string = pictureCardLink.subTitle
      const href: string = pictureCardLink.href

      const imageSources = createImageUrls(pictureCardLink, index)

      const pictureCardLinksContent: PictureCardLinksContent = {
        title: title,
        subTitle: subTitle,
        href: href,
        imageSources: imageSources,
      }
      acc.push(pictureCardLinksContent as never)
    }
    return acc
  }, [])
}

function createImageUrls(pictureCardLink: PictureCardLink, index: number): ImageUrls {
  const imageUrls: ImageUrls = {
    imageSrcSet: '',
    imageSrcSet2: '',
    imageSrcSet3: '',
    imageSrcSet4: '',
    imageSrc: '',
    imageAlt: '',
  }

  // imageSrc - mobile
  if (pictureCardLink.image) {
    imageUrls.imageSrc = imageUrl({
      id: pictureCardLink.image,
      scale: 'block(300, 400)',
      format: 'jpg',
    })
    imageUrls.imageAlt = getImageAlt(pictureCardLink.image) || ''
  } else {
    imageUrls.imageSrc = imagePlaceholder({
      width: 580,
      height: 420,
    })
  }

  // imageSrcSet - desktop
  if (pictureCardLink.image) {
    imageUrls.imageSrcSet = imageUrl({
      id: pictureCardLink.image,
      scale: index === 0 ? 'block(580, 400)' : 'block(280, 400)',
      format: 'jpg',
    })
  }

  // imageSrcSet2 - laptop
  if (pictureCardLink.image) {
    imageUrls.imageSrcSet2 = imageUrl({
      id: pictureCardLink.image,
      scale: index === 0 ? 'block(470, 400)' : 'block(225, 400)',
      format: 'jpg',
    })
  }

  // imageSrcSet3 - tablet
  if (pictureCardLink.image) {
    imageUrls.imageSrcSet3 = imageUrl({
      id: pictureCardLink.image,
      scale: index === 0 ? 'block(350, 400)' : 'block(165, 400)',
      format: 'jpg',
    })
  }

  // imageSrcSet4 - mobile
  if (pictureCardLink.image) {
    imageUrls.imageSrcSet4 = imageUrl({
      id: pictureCardLink.image,
      scale: 'block(454, 400)',
      format: 'jpg',
    })
  }

  return imageUrls
}

interface PictureCardLink {
  title: string
  subTitle: string
  href: string
  image?: string
}

interface ImageUrls {
  imageSrcSet: string
  imageSrcSet2: string
  imageSrcSet3: string
  imageSrcSet4: string
  imageSrc: string
  imageAlt: string
}

interface PictureCardLinksContent {
  title: string
  subTitle: string
  href: string
  imageSources: ImageUrls
}
