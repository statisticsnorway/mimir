import {render as r4XpRender, RenderResponse} from '/lib/enonic/react4xp'
import {  getComponent,
  getContent,
  pageUrl,
  Component} from "/lib/xp/portal";
import {CategoryLinksPartConfig} from "./categoryLinks-part-config";
import {Content} from "/lib/xp/content";
import {Language, Phrases} from "../../../lib/types/language";
import { render } from "/lib/thymeleaf"

const {
  data
} = __non_webpack_require__('/lib/util')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

const view = resolve('./categoryLinks.html')

exports.get = function(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: XP.Request): XP.Response | RenderResponse {
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
    // const categoryLinksComponent: React4xpObject = new React4xp('CategoryLinks')
    //   .setProps({
    //     links: links.map((link) => {
    //       return {
    //         href: pageUrl({
    //           id: link.href
    //         }),
    //         titleText: link.titleText,
    //         subText: link.subText
    //       }
    //     }),
    //     methodsAndDocumentationUrl,
    //     methodsAndDocumentationLabel: phrases.methodsAndDocumentation
    //   })
    //   .setId('categoryLink')
    //   .uniqueId()
    //
    // const body = render(view, {
    //   categoryId: categoryLinksComponent.react4xpId
    // })

    const body = render(view)

    const categoryLinksComponent: RenderResponse =r4XpRender(
        'CategoryLinks',
        {
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
        },
        req,
        {
          body: body
        })

    return categoryLinksComponent
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
