import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { getComponent, attachmentUrl, Component } from '/lib/xp/portal'
import { DownloadLinkPartConfig } from './downloadLink-part-config'
import { ResourceKey, render } from '/lib/thymeleaf'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp

const view: ResourceKey = resolve('./downloadLink.html') as ResourceKey

exports.get = function(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

function renderPart(req: XP.Request): XP.Response | React4xpResponse {
  const part: Component<DownloadLinkPartConfig> = getComponent()

  const downloadLinkXP: React4xpObject = new React4xp('DownloadLink')
    .setProps({
      fileLocation: attachmentUrl({
        id: part.config.file ? part.config.file : ''
      }),
      downloadText: part.config.text
    })
    .uniqueId()

  const body: string = render(view, {
    downloadLinkId: downloadLinkXP.react4xpId
  })

  return {
    body: downloadLinkXP.renderBody({
      body
    }),
    pageContributions: downloadLinkXP.renderPageContributions()
  }
}
