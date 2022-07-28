import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { getContent,
  getComponent,
  imageUrl,
  Component } from '/lib/xp/portal'
import { EntryLinksPartConfig } from './entryLinks-part-config'
import { Content, Image } from 'enonic-types/content'
import { Phrases } from '../../../lib/types/language'
import { ResourceKey, render } from 'enonic-types/thymeleaf'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getAttachmentContent
} = __non_webpack_require__('/lib/ssb/utils/utils')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./entryLinks.html') as ResourceKey

exports.get = (req: XP.Request) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

function renderPart(req: XP.Request): XP.Response | React4xpResponse {
  const page: Content = getContent()
  const part: Component<EntryLinksPartConfig> = getComponent()
  const phrases: Phrases = getPhrases(page) as Phrases

  const entryLinksContent: EntryLinksPartConfig['entryLinks'] = part.config.entryLinks ? forceArray(part.config.entryLinks) : []
  const headerTitle: string = phrases.entryLinksTitle
  if (entryLinksContent.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          headerTitle
        })
      }
    }
  }

  const isNotInEditMode: boolean = req.mode !== 'edit'
  return renderEntryLinks(headerTitle, entryLinksContent, isNotInEditMode)
}

function renderEntryLinks(headerTitle: string, entryLinksContent: EntryLinksPartConfig['entryLinks'], isNotInEditMode: boolean): React4xpResponse {
  if ( entryLinksContent && entryLinksContent.length > 0) {
    const entryLinksComponent: React4xpObject = new React4xp('EntryLinks')
      .setProps({
        headerTitle,
        entryLinks: parseEntryLinks(entryLinksContent)
      })
      .uniqueId()

    const body: string = render(view, {
      entryLinksId: entryLinksComponent.react4xpId,
      label: headerTitle
    })

    return {
      body: entryLinksComponent.renderBody({
        body,
        clientRender: isNotInEditMode
      }),
      pageContributions: entryLinksComponent.renderPageContributions({
        clientRender: isNotInEditMode
      })
    }
  } else {
    return {
      body: '',
      pageContributions: ''
    }
  }
}

function parseEntryLinks(entryLinksContent: EntryLinksPartConfig['entryLinks']): Array<LinkEntry>|undefined {
  return entryLinksContent && entryLinksContent.map(({
    title, href, icon, mobileIcon
  }) => {
    const iconData: Content<Image> | null = get({
      key: icon
    })

    let altText: string
    if (iconData && iconData.data.altText) {
      altText = iconData.data.altText
    }
    if (iconData && iconData.data.caption) {
      altText = iconData.data.caption
    }
    altText = ''

    return {
      title,
      href,
      icon: imageUrl({
        id: icon,
        scale: 'block(80,80)'
      }),
      mobileIcon: getAttachmentContent(mobileIcon),
      altText
    }
  })
}

interface LinkEntry {
    title: string;
    href: string;
    icon: string;
    mobileIcon?: string;
    altText: string;
}
