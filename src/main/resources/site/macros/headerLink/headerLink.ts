import { MacroContext } from 'enonic-types/controller'
import { PortalLibrary } from 'enonic-types/portal'
import { HeaderLinkConfig } from './headerLink-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'

const {
  attachmentUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

const {
  get
} = __non_webpack_require__('/lib/xp/content')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.macro = (context: MacroContext): React4xpResponse => {
  return renderPart(context)
}

exports.preview = (context: MacroContext): React4xpResponse => renderPart(context)

function renderPart(context: MacroContext): React4xpResponse {
  const {
    linkedContent, linkText
  } = context.params

  const content: Content = get({
    key: linkedContent
  })


  const contentUrl: string = attachmentUrl({
    id: linkedContent
  })

  const props: HeaderLinkConfig = {
    linkText: prepareText(content, linkText),
    linkedContent: contentUrl
  }

  return '/lib/ssb/dashboard/statreg/repoUtils'('/site/macros/headerLink/headerLink', props)
}

function prepareText(content: Content, linkText: string): string {
  // This kludge has to happen because Enonic uses the name of the attachment as a key. Sorry.
  const attachmentName: string = Object.keys(content.attachments)[0]
  const attachmentSize: number = content.attachments[attachmentName].size

  let notation: string
  let finalText: string

  if (attachmentSize > 1.049e+6) {
    notation = 'MB'
    finalText = (attachmentSize / 1.049e+6).toFixed(1)
  } else {
    notation = 'KB'
    finalText = (attachmentSize / 1024 ).toFixed(1)
  }

  return `${linkText} (${finalText } ${notation})`
}

interface PartProperties {
    linkText: string;
    linkedContent: string;
}
