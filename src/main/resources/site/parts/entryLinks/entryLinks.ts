import {Request} from "enonic-types/controller";

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  getComponent,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getAttachmentContent
} = __non_webpack_require__('/lib/ssb/utils/utils')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./entryLinks.html')

exports.get = (req: Request) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const part = getComponent()
  const phrases = getPhrases(page)

  const entryLinksContent = part.config.entryLinks ? forceArray(part.config.entryLinks) : []
  const headerTitle = phrases.entryLinksTitle
  if (entryLinksContent.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          headerTitle
        })
      }
    }
  }

  const isNotInEditMode = req.mode !== 'edit'
  return renderEntryLinks(headerTitle, entryLinksContent, isNotInEditMode)
}

const renderEntryLinks = (headerTitle, entryLinksContent, isNotInEditMode) => {
  if (entryLinksContent.length > 0) {
    const entryLinksComponent = new React4xp('EntryLinks')
      .setProps({
        headerTitle,
        entryLinks: parseEntryLinks(entryLinksContent)
      })
      .uniqueId()

    const body = render(view, {
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
  }

  return {
    body: null,
    pageContributions: null
  }
}

const parseEntryLinks = (entryLinksContent) => {
  return entryLinksContent.map(({
    title, href, icon, mobileIcon
  }) => {
    const iconData = get({
      key: icon
    })

    let altText
    if (iconData.data.altText) {
      altText = iconData.data.altText
    }
    if (iconData.data.caption) {
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
