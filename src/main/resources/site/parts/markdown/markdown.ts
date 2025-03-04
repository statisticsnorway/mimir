import { getComponent, processHtml } from '/lib/xp/portal'
import { render as React4xpRender } from '/lib/xp/react4xp'
import { type Node } from '/lib/xp/node'
import { render } from '/lib/markdown'
import { getMarkdownNode, type MarkdownRepoNode } from '/lib/ssb/utils/markdownUtils'
import { renderError } from '/lib/ssb/error/error'
import { type MarkdownProps } from '/lib/types/partTypes/markdown'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()
  const markdownTextProcessed: string = processHtml({
    value: component?.config.markdownText ? component.config.markdownText : '',
  })
  const markdownTextRendered: string = render(markdownTextProcessed)

  const markdownFileContent: Node<MarkdownRepoNode> | null = component?.config.markdownFile
    ? (getMarkdownNode(component?.config.markdownFile as string) as Node<MarkdownRepoNode>)
    : null
  const markdownFileProcessed: string = processHtml({
    value: markdownFileContent?.markdown ? markdownFileContent.markdown : '',
  })

  const props: MarkdownProps = {
    markdownText:
      markdownFileContent && markdownFileContent.markdown
        ? markdownTextRendered.concat(render(markdownFileProcessed))
        : markdownTextRendered,
  }

  return React4xpRender('site/parts/markdown/markdown', props, req)
}
