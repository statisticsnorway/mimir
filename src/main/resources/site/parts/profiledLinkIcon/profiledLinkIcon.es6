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

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./profiledLinkIcon.html')

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

  return renderProfiledLinks(part.config.profiledLinkItemSet ? data.forceArray(part.config.profiledLinkItemSet) : [])
}

const renderProfiledLinks = (links) => {
  if (links && links.length) {
    const profiledLinkIconsXP = new React4xp('Links')
      .setProps({
        links: links.map((link) => {
          return {
            children: link.text,
            href: pageUrl({
              id: link.href
            }),
            iconType: 'arrowRight',
            linkType: 'profiled'
          }
        })
      })
      .uniqueId()

    const body = render(view, {
      profiledLinksId: profiledLinkIconsXP.react4xpId
    })

    return {
      body: profiledLinkIconsXP.renderBody({
        body
      }),
      pageContributions: profiledLinkIconsXP.renderPageContributions()
    }
  }
  return NO_LINKS_FOUND
}


