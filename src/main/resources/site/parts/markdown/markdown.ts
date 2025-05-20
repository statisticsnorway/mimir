import { getComponent } from '/lib/xp/portal'
import { getMarkdownNode } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'

export function get(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()

  const nodeId = component?.config.markdownNode
  const node = nodeId ? getMarkdownNode(nodeId) : null

  const markdownFromNode = node?.markdown
  const markdownFromTextArea = component?.config.markdownTextArea

  const markdown = markdownFromNode ?? markdownFromTextArea

  const props = {
    markdownRendered: renderMarkdown(markdown),
  }

  return render(component, props, req, {
    body: '<section class="xp-part"></section>',
  })
}
