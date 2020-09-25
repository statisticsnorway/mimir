const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const React4xp = require('/lib/enonic/react4xp')
const {
  getContent
} = __non_webpack_require__( '/lib/xp/portal')
const util = __non_webpack_require__('/lib/util')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')

const view = resolve('./relatedExternalLinks.html')

exports.get = function(req) {
  try {
    let externalLinks = getContent().data.relatedExternalLinkItemSet
    if (externalLinks) {
      externalLinks = util.data.forceArray(externalLinks)
    } else {
      externalLinks = []
    }
    return renderPart(req, externalLinks)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, externalLinks) {
  const page = getContent()
  if (!externalLinks || externalLinks.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view)
      }
    }
    return {
      body: null
    }
  }

  const phrases = getPhrases(page)

  externalLinks = externalLinks.map((externalLink) => {
    return {
      href: externalLink.url,
      children: externalLink.urlText,
      iconType: 'externalLink',
      isExternal: true
    }
  })

  const relatedExternalLinksComponent = new React4xp('Links')
    .setProps({
      links: externalLinks,
      heading: phrases.relatedArticlesHeading
    })
    .setId('related-external-links')
    .uniqueId()

  const body = render(view, {
    relatedExternalLinksId: relatedExternalLinksComponent.react4xpId,
    label: phrases.externalLinksHeading
  })
  return {
    body: relatedExternalLinksComponent.renderBody({
      body
    }),
    pageContributions: relatedExternalLinksComponent.renderPageContributions()
  }
}
