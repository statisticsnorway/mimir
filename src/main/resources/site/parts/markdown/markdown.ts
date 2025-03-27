import { getComponent } from '/lib/xp/portal'
import { getMarkdownNode } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'

export function get(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()

  const nodeId = component.config.markdownNode
  const node = getMarkdownNode(nodeId)

  const props = {
    markdownRendered: renderMarkdown(node.markdown),
  }

  return render(component, props, req)
}
