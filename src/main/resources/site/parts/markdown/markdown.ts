import { getComponent } from '/lib/xp/portal'
import { getMarkdownText } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'

export function get(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()
  const markdownContent = component?.config.markdownContent

  let markdownText
  if (markdownContent?._selected == 'fromNode') {
    const nodeId = markdownContent?.fromNode.nodeId ?? ''
    markdownText = getMarkdownText(nodeId)
  } else {
    markdownText = markdownContent?.fromText.text
  }

  const props = {
    markdownRendered: renderMarkdown(markdownText),
  }

  return render(component, props, req, {
    body: '<section class="xp-part"></section>',
  })
}
