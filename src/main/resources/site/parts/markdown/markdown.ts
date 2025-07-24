import { getComponent } from '/lib/xp/portal'
import { getMarkdownText } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'

export function get(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.Markdown>()

  const markdownText = component ? getMarkdownTextFromComponent(component) : ''

  const props = {
    markdownRendered: renderMarkdown(markdownText),
  }

  return render(component, props, req, {
    body: '<section class="xp-part"></section>',
  })
}

function getMarkdownTextFromComponent(component: XP.PartComponent.Markdown): string {
  const optionSet = component?.config.markdownContent
  if (optionSet?._selected == 'fromNode') {
    const nodeId = optionSet?.fromNode.nodeId ?? ''
    return getMarkdownText(nodeId)
  } else {
    return optionSet?.fromText.text ?? ''
  }
}
