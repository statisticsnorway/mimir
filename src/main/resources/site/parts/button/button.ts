import { Content } from 'enonic-types/content'
import { Button } from '../../content-types/button/button'
import { attachmentUrl,
  getComponent,
  pageUrl,
  Component } from '/lib/xp/portal'
import { ButtonPartConfig } from './button-part-config'
import { ResourceKey, render } from 'enonic-types/thymeleaf'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const content = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const view: ResourceKey = resolve('./button.html') as ResourceKey

exports.get = function(req: XP.Request): XP.Response {
  try {
    const part: Component<ButtonPartConfig> = getComponent()
    const buttonsIds: Array<string> = part.config.button ? util.data.forceArray(part.config.button) : []
    return renderPart(req, buttonsIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, id: string) => renderPart(req, [id])

function renderPart(req: XP.Request, buttonIds: Array<string>): XP.Response {
  const buttons: Array<ButtonShape> = []

  buttonIds.map((key: string) => {
    const button: Content<Button> | null = content.get({
      key
    })

    if (button && button.data.link) {
      const target: Content | null = content.get({
        key: button.data.link
      })


      if (target) {
        const href: string = getHref(target)
        buttons.push({
          displayName: button.displayName,
          href: href
        })
      }
    }
  })

  const body: string = render(view, {
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
