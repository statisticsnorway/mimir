import { getComponent, getContent, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type Phrases } from '/lib/types/language'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

import { data } from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'

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

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response {
  const part = getComponent<XP.PartComponent.CategoryLinks>()
  const page = getContent()
  if (!part || !page) throw new Error('No page or part')

  const language = getLanguage(page)
  const phrases: Phrases = language?.phrases as Phrases
  const links: Array<CategoryLink> = part.config.CategoryLinkItemSet
    ? data.forceArray(part.config.CategoryLinkItemSet)
    : []
  const methodsAndDocumentation: DocumentationContent | DocumentationUrl | undefined = part.config.methodsDocumentation
  const id: string = 'categoryLink-' + randomUnsafeString()
  let methodsAndDocumentationUrl
  if (methodsAndDocumentation) {
    if (methodsAndDocumentation._selected == 'urlSource') {
      methodsAndDocumentationUrl = methodsAndDocumentation.urlSource.url
    }

    if (
      methodsAndDocumentation &&
      methodsAndDocumentation._selected == 'relatedSource' &&
      methodsAndDocumentation.relatedSource.content
    ) {
      methodsAndDocumentationUrl = pageUrl({
        id: methodsAndDocumentation.relatedSource.content,
      })
    }
  }

  if (links && links.length) {
    const categoryLinksComponent = render(
      'CategoryLinks',
      {
        links: links.map((link) => {
          return {
            href: pageUrl({
              id: link.href,
            }),
            titleText: link.titleText,
            subText: link.subText,
          }
        }),
        methodsAndDocumentationUrl,
        methodsAndDocumentationLabel: phrases.methodsAndDocumentation,
      },
      req,
      {
        id: id,
        body: `<section class="xp-part part-category-link"></section>`,
      }
    )

    return categoryLinksComponent
  }
  return NO_LINKS_FOUND
}

interface CategoryLink {
  titleText: string
  subText: string
  href: string
}

interface MethodDocumentation {
  _selected: string
}

interface DocumentationUrl extends MethodDocumentation {
  _selected: 'urlSource'
  urlSource: {
    url: string
  }
}

interface DocumentationContent extends MethodDocumentation {
  _selected: 'relatedSource'
  relatedSource: {
    content?: string
  }
}
