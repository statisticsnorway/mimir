import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { PictureCardLinksPartConfig } from './pictureCardLinks-part-config'

const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getComponent,
  imageUrl,
  imagePlaceholder
} = __non_webpack_require__('/lib/xp/portal')

const view: ResourceKey = resolve('./pictureCardLinks.html')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): Response => {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const config: PictureCardLinksPartConfig = getComponent().config
  const pictureCardLinks: React4xpObject = new React4xp('PictureCardLinks')
    .setProps({
      pictureCardLinks: parsePictureCardLinks(config.pictureCardLinks)
    })
    .uniqueId()

  const body: string = render(view, {
    pictureCardLinksId: pictureCardLinks.react4xpId
  })
  return {
    body: pictureCardLinks.renderBody({
      body
    }),
    pageContributions: pictureCardLinks.renderPageContributions() as PageContributions
  }
}

function parsePictureCardLinks(pictureCardLinks: PictureCardLinksPartConfig['pictureCardLinks']): Array<PictureCardLinksContent> {
  pictureCardLinks = Array.isArray(pictureCardLinks) ? pictureCardLinks : [pictureCardLinks]
  return pictureCardLinks.reduce((acc, pictureCardLink) => {
    if (pictureCardLink) {
      const title: string = pictureCardLink.title
      const subTitle: string = pictureCardLink.subTitle
      const href: string = pictureCardLink.href
      let imageSrc: string = ''
      let imageAlt: string = ' '
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

      const pictureCardLinksContent: PictureCardLinksContent = {
        title: title,
        subTitle: subTitle,
        href: href,
        imageSrc: imageSrc,
        imageAlt: imageAlt
      }
      acc.push(pictureCardLinksContent as never)
    }
    return acc
  }, [])
}

interface PictureCardLinksContent {
  title: string;
  subTitle: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}
