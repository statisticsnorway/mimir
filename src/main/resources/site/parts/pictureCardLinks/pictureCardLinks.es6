const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')

const view = resolve('./pictureCardLinks.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, id) {
  return renderPart(req, id)
}

function renderPart(req) {
  const part = getComponent()
  log.info(JSON.stringify(part))
  const pictureCardLinks = new React4xp('PictureCardLinks')
    .setProps({
    })
    .uniqueId()

  const body = render(view, {
    pictureCardLinksId: pictureCardLinks.react4xpId
  })
  return {
    body: pictureCardLinks.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: pictureCardLinks.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}
