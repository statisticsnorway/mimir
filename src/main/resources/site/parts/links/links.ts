import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, attachmentUrl, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type LinksProps } from '/lib/types/partTypes/links'
import { type Links as LinksPartConfig } from '.'

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Links>()
    if (!part) throw Error('No part found')

    const config: LinksPartConfig = part.config
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, config: LinksPartConfig): XP.Response {
  try {
    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}
function renderPart(req: XP.Request, config: LinksPartConfig) {
  const linkTypes: LinksPartConfig['linkTypes'] = config.linkTypes

  let props: LinksProps | object = {}
  if (linkTypes) {
    if (linkTypes._selected === 'tableLink') {
      const href: string | undefined = linkTypes.tableLink.relatedContent
        ? pageUrl({
            id: linkTypes.tableLink.relatedContent,
          })
        : linkTypes.tableLink.url

      props = {
        href,
        description: linkTypes.tableLink.description,
        text: linkTypes.tableLink.title,
      }
    }

    if (linkTypes._selected === 'headerLink') {
      const linkedContent: string | undefined = linkTypes.headerLink.linkedContent
      const linkText: string | undefined = linkTypes.headerLink.linkText

      const content: Content | null = linkedContent
        ? getContentByKey({
            key: linkedContent,
          })
        : null

      let contentUrl: string | undefined
      let isPDFAttachment = false
      let attachmentTitle: string | undefined
      if (content && Object.keys(content.attachments).length > 0) {
        contentUrl =
          linkedContent &&
          attachmentUrl({
            id: linkedContent,
          })
        isPDFAttachment = /.+?\.pdf/.test(content._name)
        attachmentTitle = content.displayName
      } else {
        contentUrl = linkedContent
          ? pageUrl({
              id: linkedContent,
            })
          : linkTypes.headerLink.headerLinkHref
      }

      props = {
        children: content ? prepareText(content, linkText) : linkText,
        href: contentUrl,
        linkType: 'header',
        isPDFAttachment,
        attachmentTitle,
      }
    }

    if (linkTypes._selected === 'profiledLink') {
      props = {
        children: linkTypes.profiledLink.text,
        href: linkTypes.profiledLink.contentUrl
          ? pageUrl({
              id: linkTypes.profiledLink.contentUrl,
            })
          : linkTypes.profiledLink.profiledLinkHref,
        withIcon: !!linkTypes.profiledLink.withIcon,
        linkType: 'profiled',
      }
    }
  }

  return render('site/parts/links/links', props, req)
}

export function prepareText(content: Content, linkText: string | undefined): string | undefined {
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
