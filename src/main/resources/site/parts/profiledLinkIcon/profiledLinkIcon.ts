import { getComponent, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

import { data } from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { type ProfiledLinkIcon as ProfiledLinkIconPartConfig } from '.'

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

const NO_LINKS_FOUND: object = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response {
  const config = getComponent<XP.PartComponent.ProfiledLinkIcon>()?.config
  if (!config) throw Error('No part found')

  return renderProfiledLinks(req, config.profiledLinkItemSet ? data.forceArray(config.profiledLinkItemSet) : [])
}

function renderProfiledLinks(req: XP.Request, links: ProfiledLinkIconPartConfig['profiledLinkItemSet']): XP.Response {
  if (links && links.length) {
    return render(
      'Links',
      {
        links: links.map((link) => {
          return {
            children: link.text,
            href: link.href
              ? pageUrl({
                  id: link.href,
                })
              : '',
            iconType: 'arrowRight',
            linkType: 'profiled',
          }
        }),
      },
      req,
      {
        body: '<section class="xp-part part-profiledLinkIcon"></section>',
        hydrate: false,
      }
    )
  }
  return NO_LINKS_FOUND
}
