import { type Component, getComponent, processHtml } from '/lib/xp/portal'
import { render as React4xpRender } from '/lib/xp/react4xp'
import { render } from '/lib/markdown'
import { getMarkdownNode } from '/lib/ssb/utils/markdownUtils'
import { renderError } from '/lib/ssb/error/error'
import { type MarkdownPartConfig } from './markdown-part-config'

exports.get = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const component: Component<MarkdownPartConfig> = getComponent()
  const markdownTextProcessed: string = processHtml({
    value: component.config.markdownText ? component.config.markdownText : '',
  })
  const markdownTextRendered: string = render(markdownTextProcessed)

  const markdownFileContent: MarkdownContent | null = component.config.markdownFile
    ? getMarkdownNode(component.config.markdownFile)
    : null
  const markdownFileProcessed: string = processHtml({
    value: markdownFileContent?.markdown ? markdownFileContent.markdown : '',
  })

  const props: PartProperties = {
    markdownText:
      markdownFileContent && markdownFileContent.markdown
        ? markdownTextRendered.concat(render(markdownFileProcessed))
        : markdownTextRendered,
  }

  return React4xpRender('site/parts/markdown/markdown', props, req)
}

interface MarkdownContent extends Content {
  markdown?: string
}

interface PartProperties {
  markdownText: string
}
