const {
  getComponent,
  attachmentUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./downloadLink.html')

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

  const downloadLinkXP = new React4xp('DownloadLink')
    .setProps({
      fileLocation: attachmentUrl({
        id: part.config.file
      }),
      downloadText: part.config.text
    })
    .uniqueId()

  const body = render(view, {
    downloadLinkId: downloadLinkXP.react4xpId
  })

  return {
    body: downloadLinkXP.renderBody({
      body
    }),
    pageContributions: downloadLinkXP.renderPageContributions()
  }
}
