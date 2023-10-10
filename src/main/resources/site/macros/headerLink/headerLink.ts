import { get, Content } from '/lib/xp/content'

import { attachmentUrl, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type HeaderLink as HeaderLinkConfig } from '/site/macros/headerLink'

export const macro = (context: XP.MacroContext) => {
  return renderPart(context)
}

export const preview = (context: XP.MacroContext) => renderPart(context)

function renderPart(context: XP.MacroContext) {
  const { linkedContent, linkText } = context.params

  const content: Content | null = get({
    key: linkedContent,
  })

  let contentUrl: string
  if (content && Object.keys(content.attachments).length > 0) {
    contentUrl = attachmentUrl({
      id: linkedContent,
    })
  } else {
    contentUrl = pageUrl({
      id: linkedContent,
    })
  }

  const props: HeaderLinkConfig = {
    linkText: content ? prepareText(content, linkText) : '',
    linkedContent: contentUrl,
  }

  return render('site/macros/headerLink/headerLink', props, context.request)
}

function prepareText(content: Content, linkText: string): string {
  // This kludge has to happen because Enonic uses the name of the attachment as a key. Sorry.
  const attachmentName: string = Object.keys(content.attachments)[0]
  const attachmentSize: number = content.attachments[attachmentName] && content.attachments[attachmentName].size

  let notation: string
  let finalText: string

  if (attachmentSize) {
    if (attachmentSize > 1.049e6) {
      notation = 'MB'
      finalText = (attachmentSize / 1.049e6).toFixed(1)
    } else {
      notation = 'KB'
      finalText = (attachmentSize / 1024).toFixed(1)
    }
    return `${linkText} (${finalText} ${notation})`
  }

  return linkText
}
