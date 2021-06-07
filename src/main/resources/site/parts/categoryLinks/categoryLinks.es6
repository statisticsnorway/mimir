const {
  data
} = __non_webpack_require__('/lib/util')
const {
  getComponent,
  getContent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

const view = resolve('./categoryLinks.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html'
}

const renderPart = (req) => {
  const part = getComponent()
  const page = getContent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const links = part.config.CategoryLinkItemSet ? data.forceArray(part.config.CategoryLinkItemSet) : []
  const methodsAndDocumentation = part.config.methodsDocumentation
  let methodsAndDocumentationUrl
  if (methodsAndDocumentation) {
    if (methodsAndDocumentation._selected == 'urlSource') {
      methodsAndDocumentationUrl = methodsAndDocumentation.urlSource.url
    }

    if (methodsAndDocumentation._selected == 'relatedSource') {
      methodsAndDocumentationUrl = pageUrl({
        id: methodsAndDocumentation.relatedSource.content
      })
    }
  }

  if (links && links.length) {
    const categoryLinksComponent = new React4xp('CategoryLinks')
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


