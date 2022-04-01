import {Request, Response} from "enonic-types/controller";
import {React4xpObject, React4xpResponse} from "../../../lib/types/react4xp";
import {Component} from "enonic-types/portal";
import {ExternalCardPartConfig} from "./externalCard-part-config";

const {
  getComponent,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  data
} = __non_webpack_require__('/lib/util')

const view = resolve('./externalCard.html')


exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: Request): Response | React4xpResponse {
  const part: Component<ExternalCardPartConfig> = getComponent()

  return renderExternalCard(req, part.config.externalCards ? data.forceArray(part.config.externalCards) : [])
}

const renderExternalCard = (req: Request, links: Array<ExternalCard>) => {
  if (links && links.length) {
    const externalCardComponent: React4xpObject = new React4xp('ExternalCards')
        .setProps({
          links: links.map((link) => {
            return {
              href: link.linkUrl,
              children: link.linkText,
              content: link.content,
              image: imageUrl({
                id: link.image,
                scale: 'height(70)'
              })
            }
          })
        })
        .setId('externalCard')
        .uniqueId()

    const body: string = render(view, {
      categoryId: externalCardComponent.react4xpId
    })

    return {
      body: externalCardComponent.renderBody({
        body,
        clientRender: req.mode !== 'edit'
      }),
      pageContributions: externalCardComponent.renderPageContributions({
        clientRender: req.mode !== 'edit'
      })
    }
  }
  return NO_LINKS_FOUND
}

interface ExternalCard {
  image: string;
  content: string;
  linkText: string;
  linkUrl: string;
}
