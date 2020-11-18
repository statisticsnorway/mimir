const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getComponent,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

//const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const React4xp = require('/lib/enonic/react4xp')
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

  return renderCategoryLinks(part.config.CategoryLinkItemSet ? data.forceArray(part.config.CategoryLinkItemSet) : [])
}

const renderCategoryLinks = (links) => {
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
        })
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


