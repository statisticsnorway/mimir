import { get as getContentByKey, type Content } from '/lib/xp/content'
import { attachmentUrl, getComponent, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'

import { renderError } from '/lib/ssb/error/error'
import * as util from '/lib/util'
import { type Button } from '/site/content-types'

const view = resolve('./button.html')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Button>()
    if (!part) throw Error('No part found')

    const buttonsIds: Array<string> = part.config.button ? util.data.forceArray(part.config.button) : []
    return renderPart(req, buttonsIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string): XP.Response {
  return renderPart(req, [id])
}

function renderPart(req: XP.Request, buttonIds: Array<string>): XP.Response {
  const buttons: Array<ButtonShape> = []

  buttonIds.map((key: string) => {
    const button: Content<Button> | null = getContentByKey({
      key,
    })

    if (button && button.data.link) {
      const target: Content | null = getContentByKey({
        key: button.data.link,
      })

      if (target) {
        const href: string = getHref(target)
        buttons.push({
          displayName: button.displayName,
          href: href,
        })
      }
    }
  })

  const body: string = render(view, {
    buttons,
  })

  return {
    body,
    contentType: 'text/html',
  }
}

function getHref(target: Content<any>): string {
  if (target.type === `${app.name}:page` || target.type === `${app.name}:statistics`) {
    return pageUrl({
      id: target._id,
    })
  } else {
    return attachmentUrl({
      id: target._id,
    })
  }
}

interface ButtonShape {
  displayName: string
  href: string
}
