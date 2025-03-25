import { getComponent } from '/lib/xp/portal'
import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'

export function get(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()

  const conn = connectMarkdownRepo()

  const nodeId = component.config.markdownNode
  const node = conn.get(nodeId)

  const props = {
    markdownRendered: renderMarkdown(node.markdown),
  }

  return render(component, props, req)
}
