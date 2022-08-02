import {render, RenderResponse} from '/lib/enonic/react4xp'
import { getComponent, attachmentUrl, Component } from '/lib/xp/portal'
import { DownloadLinkPartConfig } from './downloadLink-part-config'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.get = function(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

function renderPart(req: XP.Request): RenderResponse {
  const part: Component<DownloadLinkPartConfig> = getComponent()

  return render('DownloadLink',
    {
      fileLocation: attachmentUrl({
        id: part.config.file ? part.config.file : ''
      }),
      downloadText: part.config.text
    },
      req,
      {
        body: '<section class="xp-part part-download-link"></section>'
      })
}
