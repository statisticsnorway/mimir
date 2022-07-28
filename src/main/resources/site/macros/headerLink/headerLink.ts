import { HeaderLinkConfig } from './headerLink-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { get, Content } from '/lib/xp/content'

const {
  attachmentUrl, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.macro = (context: XP.MacroContext): React4xpResponse => {
  return renderPart(context)
}

exports.preview = (context: XP.MacroContext): React4xpResponse => renderPart(context)

function renderPart(context: XP.MacroContext): React4xpResponse {
  const {
    linkedContent, linkText
  } = context.params

  const content: Content | null = get({
    key: linkedContent
  })

  let contentUrl: string
  if (content && Object.keys(content.attachments).length > 0) {
    contentUrl = attachmentUrl({
      id: linkedContent
    })
  } else {
    contentUrl = pageUrl({
      id: linkedContent
    })
  }

  const props: HeaderLinkConfig = {
    linkText: content ? prepareText(content, linkText) : '',
    linkedContent: contentUrl
  }

  return React4xp.render('site/macros/headerLink/headerLink', props)
}

function prepareText(content: Content, linkText: string): string {
  // This kludge has to happen because Enonic uses the name of the attachment as a key. Sorry.
  const attachmentName: string = Object.keys(content.attachments)[0]
  const attachmentSize: number = content.attachments[attachmentName] && content.attachments[attachmentName].size

  let notation: string
  let finalText: string

  if (attachmentSize) {
    if (attachmentSize > 1.049e+6) {
      notation = 'MB'
      finalText = (attachmentSize / 1.049e+6).toFixed(1)
    } else {
      notation = 'KB'
      finalText = (attachmentSize / 1024 ).toFixed(1)
    }
    return `${linkText} (${finalText } ${notation})`
  }

  return linkText
}

interface PartProperties {
    linkText: string;
    linkedContent: string;
}
