import { render, RenderResponse } from '/lib/enonic/react4xp'
import type { Links as LinksConfig } from '/site/macros/links'
import { get, Content } from '/lib/xp/content'
import { LinksProps, prepareText } from '/site/parts/links/links'
import type { TableLink } from '/site/mixins/tableLink'
import type { HeaderLink } from '/site/mixins/headerLink'
import type { ProfiledLink } from '/site/mixins/profiledLink'
import { GA_TRACKING_ID } from '/site/pages/default/default'

const { attachmentUrl, pageUrl } = __non_webpack_require__('/lib/xp/portal')

exports.macro = function (context: XP.MacroContext): RenderResponse {
  const config: LinksConfig & TableLink & HeaderLink & ProfiledLink = context.params
  const linkType: string | undefined = config.linkTypes

  let props: LinksProps | object = {}
  if (linkType) {
    if (linkType === 'tableLink') {
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
        isPDFAttachment = /(.*?).pdf/.test(content._name)
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
        GA_TRACKING_ID: GA_TRACKING_ID,
        isPDFAttachment,
        attachmentTitle,
      }
    }

    if (linkType === 'profiledLink') {
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
  }

  return render('site/parts/links/links', props)
}
