import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { ProfiledLinkIconPartConfig } from './profiledLinkIcon-part-config'

const {
  data
} = __non_webpack_require__('/lib/util')
const {
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./profiledLinkIcon.html')

exports.get = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): Response => renderPart(req)

const NO_LINKS_FOUND: object = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: Request): Response {
  const config: ProfiledLinkIconPartConfig = getComponent().config

  return renderProfiledLinks(config.profiledLinkItemSet ? data.forceArray(config.profiledLinkItemSet) : [])
}

function renderProfiledLinks(links: ProfiledLinkIconPartConfig['profiledLinkItemSet']): Response {
  if (links && links.length) {
    const profiledLinkIconsXP: React4xpObject = new React4xp('Links')
      .setProps({
        links: links.map((link) => {
          return {
            children: link.text,
            href: link.href ? pageUrl({
              id: link.href
            }) : '',
            iconType: 'arrowRight',
            linkType: 'profiled'
          }
        })
      })
      .uniqueId()

    const body: string = render(view, {
      profiledLinksId: profiledLinkIconsXP.react4xpId
    })

    return {
      body: profiledLinkIconsXP.renderBody({
        body
      }),
      pageContributions: profiledLinkIconsXP.renderPageContributions() as PageContributions
    }
  }
  return NO_LINKS_FOUND
}


