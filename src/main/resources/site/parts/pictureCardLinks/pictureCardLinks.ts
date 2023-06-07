import type { PictureCardLinks as PictureCardLinksPartConfig } from '.'
import { getComponent, imagePlaceholder } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

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
  const config = getComponent()?.config as PictureCardLinksPartConfig
  if (!config) throw Error('No part found')

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
  return pictureCardLinks.reduce((acc, pictureCardLink, i) => {
    if (pictureCardLink) {
      const title: string = pictureCardLink.title
      const subTitle: string = pictureCardLink.subTitle
      const href: string = pictureCardLink.href

      const imageSources = createImageUrls(pictureCardLink, i)

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

function createImageUrls(pictureCardLink: PictureCardLink, i: number): ImageUrls {
  const imageUrls: ImageUrls = {
    portraitSrcSet: '',
    landscapeSrcSet: '',
    imageSrc: '',
    imageAlt: '',
  }

  if (pictureCardLink.image) {
    imageUrls.imageSrc = imageUrl({
      id: pictureCardLink.image,
      scale: 'block(580, 400)',
    })

    imageUrls.landscapeSrcSet = imageUrls.imageSrc
    if (i > 0) imageUrls.portraitSrcSet = imageUrls.imageSrc.replace('block-580-400', 'block-280-400')
    imageUrls.imageAlt = getImageAlt(pictureCardLink.image) || ''
  } else {
    imageUrls.imageSrc = imagePlaceholder({
      width: 580,
      height: 420,
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
  portraitSrcSet: string
  landscapeSrcSet: string
  imageSrc: string
  imageAlt: string
}

interface PictureCardLinksContent {
  title: string
  subTitle: string
  href: string
  imageSources: ImageUrls
}
