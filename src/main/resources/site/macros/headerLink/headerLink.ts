import { get, Content } from '/lib/xp/content'

import { attachmentUrl, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { prepareText } from '/site/parts/links/links'
import { type HeaderLink as HeaderLinkConfig } from '/site/macros/headerLink'

export const macro = (context: XP.MacroContext<HeaderLinkConfig>) => {
  return renderPart(context)
}

export const preview = (context: XP.MacroContext<HeaderLinkConfig>) => renderPart(context)

function renderPart(context: XP.MacroContext<HeaderLinkConfig>) {
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
    linkText: content ? (prepareText(content, linkText) as string) : '',
    linkedContent: contentUrl,
  }

  return render('site/macros/headerLink/headerLink', props, context.request)
}
