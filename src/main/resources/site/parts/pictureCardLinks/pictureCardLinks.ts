import type { PictureCardLinks as PictureCardLinksPartConfig } from '.'
import { getComponent, imageUrl, imagePlaceholder } from '/lib/xp/portal'
import { render, RenderResponse } from '/lib/enonic/react4xp'

const { getImageAlt } = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
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
  return pictureCardLinks.reduce((acc, pictureCardLink) => {
    if (pictureCardLink) {
      const title: string = pictureCardLink.title
      const subTitle: string = pictureCardLink.subTitle
      const href: string = pictureCardLink.href
      let imageSrc = ''
      let imageAlt = ' '
      if (pictureCardLink.image) {
        imageSrc = imageUrl({
          id: pictureCardLink.image,
          scale: 'block(580, 420)',
        })
        imageAlt = getImageAlt(pictureCardLink.image) || ' '
      } else {
        imageSrc = imagePlaceholder({
          width: 580,
          height: 420,
        })
      }

      const pictureCardLinksContent: PictureCardLinksContent = {
        title: title,
        subTitle: subTitle,
        href: href,
        imageSrc: imageSrc,
        imageAlt: imageAlt,
      }
      acc.push(pictureCardLinksContent as never)
    }
    return acc
  }, [])
}

interface PictureCardLinksContent {
  title: string
  subTitle: string
  href: string
  imageSrc: string
  imageAlt: string
}
