import { Content } from 'enonic-types/content'
import { Component } from 'enonic-types/portal'
import { LinksPartConfig } from './links-part-config'
import { Request, Response, ResponseType } from 'enonic-types/controller'
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

exports.get = (req: Request): React4xpResponse | Response<ResponseType> => {
  try {
    const part: Component<LinksPartConfig> = getComponent()
    const config: LinksPartConfig = part.config
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, config: LinksPartConfig): React4xpResponse | Response<ResponseType> => {
  try {
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}
function renderPart(req: Request, config: LinksPartConfig): React4xpResponse {
  const linkType: string | undefined = config.linkTypes?._selected
  const isNotInEditMode: boolean = req.mode !== 'edit'

  let props: LinksProps | {} = {}
  if (linkType) {
    if (linkType === 'tableLink') {
      const href: string | undefined = config.linkTypes?.tableLink?.relatedContent ? pageUrl({
        id: config.linkTypes?.tableLink?.relatedContent
      }) : config.linkTypes?.tableLink?.url

      props = {
        href,
        description: config.linkTypes?.tableLink?.description,
        text: config.linkTypes?.tableLink?.title
      }
    }

    if (linkType === 'headerLink') {
      const linkedContent: string | undefined = config.linkTypes?.headerLink?.linkedContent
      const linkText: string | undefined = config.linkTypes?.headerLink?.linkText

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

    if (linkType === 'profiledLink') {
      props = {
        children: config.linkTypes?.profiledLink?.text,
        href: config.linkTypes?.profiledLink?.contentUrl && pageUrl({
          id: config.linkTypes?.profiledLink?.contentUrl
        }),
        withIcon: config.linkTypes?.profiledLink?.withIcon,
        linkType: 'profiled'
      }
    }
  }

  return React4xp.render('site/parts/links/links', props, req, {
    clientRender: isNotInEditMode
  })
}

function prepareText(content: Content, linkText: string | undefined): string | undefined {
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

interface LinksProps {
  children: string;
  href: string;
  withIcon: boolean;
  linkType: string;
  description: string;
  title: string;
}
