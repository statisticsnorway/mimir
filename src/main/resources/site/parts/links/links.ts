import { get, Content } from '/lib/xp/content'
import { getComponent,
  attachmentUrl,
  pageUrl,
  Component } from '/lib/xp/portal'
import { LinksPartConfig } from './links-part-config'
import {render, RenderResponse} from '/lib/enonic/react4xp'
import { renderError } from '../../../lib/ssb/error/error'
import { GA_TRACKING_ID } from '../../pages/default/default'



exports.get = (req: XP.Request): RenderResponse | XP.Response => {
  try {
    const part: Component<LinksPartConfig> = getComponent()
    const config: LinksPartConfig = part.config
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, config: LinksPartConfig): RenderResponse | XP.Response => {
  try {
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}
function renderPart(req: XP.Request, config: LinksPartConfig): RenderResponse {
  const linkTypes: LinksPartConfig['linkTypes'] = config.linkTypes
  const isNotInEditMode: boolean = req.mode !== 'edit'

  let props: LinksProps | {} = {}
  if (linkTypes) {
    if (linkTypes._selected === 'tableLink') {
      const href: string | undefined = linkTypes.tableLink.relatedContent ? pageUrl({
        id: linkTypes.tableLink.relatedContent
      }) : linkTypes.tableLink.url

      props = {
        href,
        description: linkTypes.tableLink.description,
        text: linkTypes.tableLink.title
      }
    }

    if (linkTypes._selected === 'headerLink') {
      const linkedContent: string | undefined = linkTypes.headerLink.linkedContent
      const linkText: string | undefined = linkTypes.headerLink.linkText

      const content: Content | null = linkedContent ? get({
        key: linkedContent
      }) : null

      let contentUrl: string | undefined
      let isPDFAttachment: boolean = false
      let attachmentTitle: string | undefined
      if (content && Object.keys(content.attachments).length > 0) {
        contentUrl = linkedContent && attachmentUrl({
          id: linkedContent
        })
        isPDFAttachment = (/(.*?).pdf/).test(content._name)
        attachmentTitle = content.displayName
      } else {
        contentUrl = linkedContent && pageUrl({
          id: linkedContent
        })
      }

      props = {
        children: content ? prepareText(content, linkText) : '',
        href: contentUrl,
        linkType: 'header',
        GA_TRACKING_ID: GA_TRACKING_ID,
        isPDFAttachment,
        attachmentTitle
      }
    }

    if (linkTypes._selected === 'profiledLink') {
      props = {
        children: linkTypes.profiledLink.text,
        href: linkTypes.profiledLink.contentUrl && pageUrl({
          id: linkTypes.profiledLink.contentUrl
        }),
        withIcon: !!linkTypes.profiledLink.withIcon,
        linkType: 'profiled'
      }
    }
  }

  return render('site/parts/links/links', props, req, {
    clientRender: isNotInEditMode
  })
}

export function prepareText(content: Content, linkText: string | undefined): string | undefined {
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

  return linkText && linkText
}

export interface LinksProps {
  children: string;
  href: string;
  withIcon: boolean | string;
  linkType: string;
  description: string;
  title: string;
}
