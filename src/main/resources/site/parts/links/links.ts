import { Content } from 'enonic-types/content'
import { Component } from 'enonic-types/portal'
import { LinksPartConfig } from './links-part-config'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { renderError } from '../../../lib/ssb/error/error'

const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  attachmentUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    const part: Component<LinksPartConfig> = getComponent()
    const config: LinksPartConfig = part.config
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, config: LinksPartConfig): React4xpResponse | Response => {
  try {
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}
function renderPart(req: Request, config: LinksPartConfig): React4xpResponse {
  const linkTypes: LinksPartConfig['linkTypes'] = config.linkTypes
  const isNotInEditMode: boolean = req.mode !== 'edit'

  let props: LinksProps | {} = {}
  if (linkTypes) {
    if (linkTypes._selected === 'tableLink') {
      const href: string | undefined = linkTypes.tableLink.relatedContent ? pageUrl({
        id: linkTypes.tableLink.relatedContent as string
      }) : linkTypes.tableLink.url as string | undefined

      props = {
        href,
        description: linkTypes.tableLink.description,
        text: linkTypes.tableLink.title
      }
    }

    if (linkTypes._selected === 'headerLink') {
      const linkedContent: string | undefined = linkTypes.headerLink.linkedContent as string | undefined
      const linkText: string | undefined = linkTypes.headerLink.linkText as string | undefined

      const content: Content | null = linkedContent ? get({
        key: linkedContent
      }) : null

      let contentUrl: string | undefined
      if (content && Object.keys(content.attachments).length > 0) {
        contentUrl = linkedContent && attachmentUrl({
          id: linkedContent
        })
      } else {
        contentUrl = linkedContent && pageUrl({
          id: linkedContent
        })
      }

      props = {
        children: content ? prepareText(content, linkText) : '',
        href: contentUrl,
        linkType: 'header'
      }
    }

    if (linkTypes._selected === 'profiledLink') {
      props = {
        children: linkTypes.profiledLink.text,
        href: linkTypes.profiledLink.contentUrl && pageUrl({
          id: linkTypes.profiledLink.contentUrl as string
        }),
        withIcon: !!linkTypes.profiledLink.withIcon,
        linkType: 'profiled'
      }
    }
  }

  return React4xp.render('site/parts/links/links', props, req, {
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
