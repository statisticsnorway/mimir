import {Request, Response} from "enonic-types/controller";
import {React4xpObject, React4xpResponse} from "../../../lib/types/react4xp";
import {Component} from "enonic-types/portal";
import {CategoryLinksPartConfig} from "./categoryLinks-part-config";
import {Content} from "enonic-types/content";
import {Language, Phrases} from "../../../lib/types/language";
import { render } from "/lib/thymeleaf"

const {
  data
} = __non_webpack_require__('/lib/util')
const {
  getComponent,
  getContent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

const view = resolve('./categoryLinks.html')

exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: Request): Response | React4xpResponse {
  const part: Component<CategoryLinksPartConfig> = getComponent()
  const page: Content = getContent()
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const links: Array<CategoryLink> = part.config.CategoryLinkItemSet ? data.forceArray(part.config.CategoryLinkItemSet) : []
  const methodsAndDocumentation: DocumentationContent | DocumentationUrl | undefined = part.config.methodsDocumentation
  let methodsAndDocumentationUrl
  if (methodsAndDocumentation) {
    if (methodsAndDocumentation._selected == 'urlSource') {
      methodsAndDocumentationUrl = methodsAndDocumentation.urlSource.url
    }

    if (methodsAndDocumentation
        && methodsAndDocumentation._selected == 'relatedSource'
        && methodsAndDocumentation.relatedSource.content) {
      methodsAndDocumentationUrl = pageUrl({
        id: methodsAndDocumentation.relatedSource.content
      })
    }
  }

  if (links && links.length) {
    const categoryLinksComponent: React4xpObject = new React4xp('CategoryLinks')
      .setProps({
        links: links.map((link) => {
          return {
            href: pageUrl({
              id: link.href
            }),
            titleText: link.titleText,
            subText: link.subText
          }
        }),
        methodsAndDocumentationUrl,
        methodsAndDocumentationLabel: phrases.methodsAndDocumentation
      })
      .setId('categoryLink')
      .uniqueId()

    const body = render(view, {
      categoryId: categoryLinksComponent.react4xpId
    })

    return {
      body: categoryLinksComponent.renderBody({
        body
      }),
      pageContributions: categoryLinksComponent.renderPageContributions()
    }
  }
  return NO_LINKS_FOUND
}

interface CategoryLink {
  titleText: string;
  subText: string;
  href: string;
}

interface MethodDocumentation {
  _selected: string
}

interface DocumentationUrl extends MethodDocumentation {
  _selected: 'urlSource'
  urlSource: {
    url: string;
  };
}

interface DocumentationContent extends MethodDocumentation {
  _selected: 'relatedSource'
  relatedSource: {
    content?: string;
  };
}
