const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getComponent, getContent
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
  const part = getComponent()
  const externalLinkConfig = part.config.relatedExternalLinkItemSet ? data.forceArray(part.config.relatedExternalLinkItemSet) : []

  /* TODO: get information from config  */
  const page = getContent()

  return externalLinkConfig.length ? renderExternalLinks(externalLinkConfig) : {
    body: ''
  }
}

/**
 *
 * @param {array} externalLinkConfig
 * @param {object} part
 * @return {{body: string}}
 */
function renderExternalLinks(externalLinkConfig) {
  const link = new React4xp('Link')
  externalLinkConfig.map((links) => {
    link.setProps({
      href: links.url,
      children: links.urlText,
      hasIcon: true,
      iconType: 'externalLink'
    })
     .uniqueId()
  })

  const body = render(view, {
    externalLinksId: link.react4xpId
  })

  return {
    body: link.renderBody({
      body
    })
  }
}


