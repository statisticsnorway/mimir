const {
  data
} = __non_webpack_require__('/lib/util')
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

const NO_BUTTONS_FOUND = {
  body: ''
}

const renderPart = (req) => {
  const part = getComponent()
  const buttons = part.config.downloadButtonItemSet ? data.forceArray(part.config.downloadButtonItemSet) : []

  return renderDownloadButton(buttons)
}

const renderDownloadButton = (buttons) => {
  if (buttons && buttons.length) {
    const downloadButtonXP = new React4xp('download-buttons/DownloadButtons')
      .setProps({
        buttons: buttons.map(({
          file, text
        }) => {
          return {
            fileLocation: attachmentUrl({
              id: file
            }),
            downloadText: text
          }
        })
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
  return NO_BUTTONS_FOUND
}
