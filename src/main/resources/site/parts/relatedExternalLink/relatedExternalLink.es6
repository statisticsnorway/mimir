const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./relatedExternalLink.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const externalLinkConfig = page.data.relatedExternalLinkItemSet ? data.forceArray(page.data.relatedExternalLinkItemSet) : []

  return externalLinkConfig.length ? renderExternalLinks(externalLinkConfig) : {
    body: ''
  }
}

/**
 *
 * @param {array} externalLinkConfig
 * @return {{body: string}}
 */
function renderExternalLinks(externalLinkConfig) {
  const link = new React4xp('Links')
    .setProps({
      links: externalLinkConfig.map((links) => {
        return {
          href: links.url,
          children: links.urlText,
          hasIcon: true,
          iconType: 'externalLink',
          isExternal: true
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    externalLinksId: link.react4xpId
  })

  return {
    body: link.renderBody({
      body
    }),
    pageContributions: link.renderPageContributions()
  }
}


