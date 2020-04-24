const {
  getComponent,
  attachmentUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./downloadButton.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const part = getComponent()

  const downloadButtonXP = new React4xp('DownloadButton')
    .setProps({
      fileLocation: attachmentUrl({
        id: part.config.file
      }),
      downloadText: part.config.text
    })
    .uniqueId()

  const body = render(view, {
    downloadButtonId: downloadButtonXP.react4xpId
  })

  return {
    body: downloadButtonXP.renderBody({
      body
    }),
    pageContributions: downloadButtonXP.renderPageContributions()
  }
}
