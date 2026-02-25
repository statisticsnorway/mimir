import { get, Content } from '/lib/xp/content'
import { attachmentUrl, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type LinksProps } from '/lib/types/partTypes/links'
import { prepareText } from '/site/parts/links/links'
import { type TableLink } from '/site/mixins/tableLink'
import { type HeaderLink } from '/site/mixins/headerLink'
import { type ProfiledLink } from '/site/mixins/profiledLink'
import { type Links as LinksConfig } from '.'

export function macro(context: XP.MacroContext<LinksConfig>) {
  const config = context.params as unknown as LinksConfig & TableLink & HeaderLink & ProfiledLink
  const linkType: string | undefined = config.linkTypes

  let props: LinksProps | object = {}
  if (linkType) {
    if (linkType === 'headerLink') {
      const linkedContent: string | undefined = config.linkedContent
      const linkText: string | undefined = config.linkText

      const content: Content | null = linkedContent
        ? get({
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
          : config.headerLinkHref
      }

      props = {
        children: content ? prepareText(content, linkText) : linkText,
        href: contentUrl,
        linkType: 'header',
        isPDFAttachment,
        attachmentTitle,
      }
    } else if (linkType === 'profiledLink') {
      props = {
        children: config.text,
        href: config.contentUrl
          ? pageUrl({
              id: config.contentUrl,
            })
          : config.profiledLinkHref,
        withIcon: config.withIcon,
        linkType: 'profiled',
      }
    }

    // if (linkType === 'tableLink') {
    // tableLink should be default, we may have some corrupt data so instead of the above if statement, we default to this behaviour.
    else {
      const href: string | undefined = config.relatedContent
        ? pageUrl({
            id: config.relatedContent,
          })
        : config.url

      props = {
        href,
        description: config.description,
        text: config.title,
      }
    }
  }

  return render('site/parts/links/links', props, context.request)
}
