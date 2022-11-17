import { render, type RenderResponse } from '/lib/enonic/react4xp'
import { getComponent, getContent, pageUrl, type Component } from '/lib/xp/portal'
import type { CategoryLinks as CategoryLinksPartConfig } from '.'
import type { Content } from '/lib/xp/content'
import { Language, type Phrases } from '../../../lib/types/language'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

const { data } = __non_webpack_require__('/lib/util')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

const { getLanguage } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): XP.Response | RenderResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response | RenderResponse {
  return renderPart(req)
}

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response | RenderResponse {
  const part: Component<CategoryLinksPartConfig> = getComponent()
  const page: Content = getContent()
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
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
    const categoryLinksComponent: RenderResponse = render(
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
