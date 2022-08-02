import { Content } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { render as r4xpRender, RenderResponse } from '/lib/enonic/react4xp'
import { Article } from '../../content-types/article/article'
import { Statistics } from '../../content-types/statistics/statistics'
import { RelatedExternalLinks } from '../../mixins/relatedExternalLinks/relatedExternalLinks'


const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const util = __non_webpack_require__('/lib/util')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const view: ResourceKey = resolve('./relatedExternalLinks.html')

exports.get = function(req: XP.Request): XP.Response {
  try {
    const page: Content<Article | Statistics> = getContent()
    let externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet'] = page.data.relatedExternalLinkItemSet
    if (externalLinks) {
      externalLinks = util.data.forceArray(externalLinks as RelatedExternalLinks) as RelatedExternalLinks['relatedExternalLinkItemSet']
    } else {
      externalLinks = []
    }
    return renderPart(req, externalLinks)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet']): XP.Response => renderPart(req, externalLinks)

function renderPart(req: XP.Request, externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet']): XP.Response {
  const page: Content = getContent()

  const phrases: Phrases = getPhrases(page)
  const externalLinksTitle: string = phrases.externalLinksHeading
  if (!externalLinks || externalLinks.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          externalLinksTitle
        })
      }
    }
    return {
      body: null
    }
  }

  const body: string = render(view, {
    label: externalLinksTitle
  })

  return r4xpRender('Links',
    {
      links: externalLinks.map((externalLink) => {
        return {
          href: externalLink.url,
          children: externalLink.urlText,
          iconType: 'externalLink',
          isExternal: true
        }
      })
    },
    req,
    {
      body: body
    })
}
