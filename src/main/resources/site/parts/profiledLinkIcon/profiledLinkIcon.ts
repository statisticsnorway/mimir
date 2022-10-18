import {render} from '/lib/enonic/react4xp'
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

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

const NO_LINKS_FOUND: object = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: XP.Request): XP.Response {
  const config: ProfiledLinkIconPartConfig = getComponent().config

  return renderProfiledLinks(req,config.profiledLinkItemSet ? data.forceArray(config.profiledLinkItemSet) : [])
}

function renderProfiledLinks(req: XP.Request, links: ProfiledLinkIconPartConfig['profiledLinkItemSet']): XP.Response {
  if (links && links.length) {
    return render('Links',
        {
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
        },
        req,
        {
          body: '<section class="xp-part part-profiledLinkIcon"></section>'
        }
    )
  }
  return NO_LINKS_FOUND
}


