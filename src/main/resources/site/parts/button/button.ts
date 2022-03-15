import {Request, Response} from "enonic-types/controller";
import {Content} from "enonic-types/content";
import {Button} from "../../content-types/button/button";
import {Component} from "enonic-types/portal";
import {ButtonPartConfig} from "./button-part-config";

const {
  attachmentUrl,
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const content = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const view = resolve('./button.html')

exports.get = function(req: Request): Response {
  try {
    const part: Component<ButtonPartConfig> = getComponent()
    const buttonsIds: Array<string> = part.config.button ? util.data.forceArray(part.config.button) : []
    return renderPart(req, buttonsIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, id: string) => renderPart(req, [id])

function renderPart(req: Request, buttonIds: Array<string>): Response {
  let buttons: Array<ButtonShape> = []

  buttonIds.map((key: string) => {
    const button: Content<Button> | null = content.get({
      key
    })

    if (button && button.data.link) {
      const target: Content<any> | null = content.get({
        key: button.data.link
      })


      if (target) {
        const href = getHref(target)
        buttons.push({
          displayName: button.displayName,
          href: href
        })
      }
    }
  })

  const body = render(view, {
    buttons
  })

  return {
    body,
    contentType: 'text/html'
  }
}

function getHref(target: Content<any>): string {
  if (target.type === `${app.name}:page` || target.type === `${app.name}:statistics`) {
    return pageUrl({
      id: target._id
    })
  } else {
    return attachmentUrl({
      id: target._id
    })
  }
}

interface ButtonShape {
  displayName: string;
  href: string;
}
