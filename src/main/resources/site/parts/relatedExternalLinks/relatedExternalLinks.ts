import { type Content } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { type Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { getPhrases } from '/lib/ssb/utils/language'
import * as util from '/lib/util'
import { type Article, type Statistics } from '/site/content-types'
import { type RelatedExternalLinks } from '/site/mixins/relatedExternalLinks'

const view = resolve('./relatedExternalLinks.html')

export function get(req: XP.Request): XP.Response {
  try {
    const page = getContent<Content<Article | Statistics>>()
    if (!page) throw Error('No page found')

    let externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet'] = page.data.relatedExternalLinkItemSet
    if (externalLinks) {
      externalLinks = util.data.forceArray(
        externalLinks as RelatedExternalLinks
      ) as RelatedExternalLinks['relatedExternalLinkItemSet']
    } else {
      externalLinks = []
    }
    return renderPart(req, externalLinks)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(
  req: XP.Request,
  externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet']
): XP.Response {
  return renderPart(req, externalLinks)
}

function renderPart(req: XP.Request, externalLinks: RelatedExternalLinks['relatedExternalLinkItemSet']): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const phrases = getPhrases(page) as Phrases
  const externalLinksTitle: string = phrases.externalLinksHeading
  if (!externalLinks || externalLinks.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          externalLinksTitle,
        }),
      }
    }
    return {
      body: null,
    }
  }

  const body: string = render(view, {
    label: externalLinksTitle,
  })

  return r4xpRender(
    'Links',
    {
      links: externalLinks.map((externalLink) => {
        return {
          href: externalLink.url,
          children: externalLink.urlText,
          iconType: 'externalLink',
          isExternal: true,
        }
      }),
    },
    req,
    {
      body: body,
    }
  )
}
