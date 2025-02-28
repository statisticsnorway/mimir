import { render as React4xpRender } from '/lib/xp/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type MarkdownRepoNode } from '/lib/ssb/utils/markdownUtils'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdownCharts part: ', e)
  }
}

export function preview(req: XP.Request, content: MarkdownRepoNode): XP.Response {
  try {
    return renderPart(req, content)
  } catch (e) {
    return renderError(req, 'Error in markdownCharts part: ', e)
  }
}

function renderPart(req: XP.Request, content?: MarkdownRepoNode): XP.Response {
  const options: object = content && content.markdown ? JSON.parse(content.markdown) : {}

  const props: PartProperties = {
    options,
  }

  return React4xpRender('site/parts/markdownCharts/markdownCharts', props, req)
}

interface PartProperties {
  options: object
}
