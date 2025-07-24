import { getComponent, getContent } from '/lib/xp/portal'
import { type Content } from '/lib/xp/content'
import { getMarkdownText } from '/lib/ssb/utils/markdownUtils'
import { render } from '/lib/enonic/react4xp'
import { render as renderMarkdown } from '/lib/markdown'
import { type Markdown } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  const content = getContent<Content<Markdown>>()
  const component = getComponent<XP.PartComponent.Markdown>()

  let markdownText: string = ''
  if (content?.type == 'mimir:markdown') {
    markdownText = getMarkdownTextFromContent(content)
  } else if (component) {
    markdownText = getMarkdownTextFromComponent(component)
  }

  const props = {
    markdownRendered: renderMarkdown(markdownText),
  }

  return render(component, props, req, {
    body: '<section class="xp-part"></section>',
  })
}

function getMarkdownTextFromComponent(component: XP.PartComponent.Markdown): string {
  const optionSet = component.config.markdownContent
  if (optionSet._selected == 'fromNode') {
    const nodeId = optionSet.fromNode.nodeId ?? ''
    return nodeId ? getMarkdownText(nodeId) : ''
  } else {
    return optionSet.fromText.text ?? ''
  }
}

function getMarkdownTextFromContent(content: Content<Markdown>): string {
  const nodeId = content.data.nodeId ?? ''
  return nodeId ? getMarkdownText(nodeId) : ''
}
