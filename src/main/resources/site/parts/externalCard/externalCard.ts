import { render, type RenderResponse } from '/lib/enonic/react4xp'
import { getComponent } from '/lib/xp/portal'
import { imageUrl } from '/lib/ssb/utils/imageUtils'
import type { ExternalCard as ExternalCardPartConfig } from '.'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { data } = __non_webpack_require__('/lib/util')

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response | RenderResponse {
  const part = getComponent<ExternalCardPartConfig>()
  if (!part) throw Error('No part found')

  return renderExternalCard(req, part.config.externalCards ? data.forceArray(part.config.externalCards) : [])
}

const renderExternalCard = (req: XP.Request, links: Array<ExternalCard>) => {
  if (links && links.length) {
    return render(
      'ExternalCards',
      {
        links: links.map((link) => {
          return {
            href: link.linkUrl,
            children: link.linkText,
            content: link.content,
            image: imageUrl({
              id: link.image,
              scale: 'height(70)',
              format: 'jpg',
            }),
          }
        }),
      },
      req,
      {
        body: '<section class="xp-part part-external-card"></section>',
      }
    )
  }
  return NO_LINKS_FOUND
}

interface ExternalCard {
  image: string
  content: string
  linkText: string
  linkUrl: string
}
