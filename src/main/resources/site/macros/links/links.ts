import { MacroContext } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { LinksConfig } from './links-config'
import { Content } from 'enonic-types/content'
import { LinksProps, prepareText } from '../../parts/links/links'
import { TableLink } from '../../mixins/tableLink/tableLink'
import { HeaderLink } from '../../mixins/headerLink/headerLink'
import { ProfiledLink } from '../../mixins/profiledLink/profiledLink'

const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  attachmentUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.macro = function(context: MacroContext): React4xpResponse {
  const config: LinksConfig & TableLink & HeaderLink & ProfiledLink = context.params
  const linkType: string | undefined = config.linkTypes

  let props: LinksProps | {} = {}
  if (linkType) {
    if (linkType === 'tableLink') {
      const href: string | undefined = config.relatedContent ? pageUrl({
        id: config.relatedContent
      }) : config.url

      props = {
        href,
        description: config.description,
        text: config.title
      }
    }

    if (linkType === 'headerLink') {
      const linkedContent: string | undefined = config.linkedContent
      const linkText: string | undefined = config.linkText

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
        children: config.text,
        href: config.contentUrl && pageUrl({
          id: config.contentUrl
        }),
        withIcon: config.withIcon,
        linkType: 'profiled'
      }
    }
  }

  return React4xp.render('site/parts/links/links', props)
}
