const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent,
  getComponent,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./entryLinks.html')

exports.get = (req) => {
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

  moment.locale(page.language ? page.language : 'nb')
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

  return renderEntryLinks(headerTitle, entryLinksContent, req)
}

const renderEntryLinks = (headerTitle, entryLinksContent, req) => {
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

    const isOutsideContentStudio = (
      req.mode === 'live' || req.mode === 'preview'
    )

    return {
      body: entryLinksComponent.renderBody({
        body
      }),
      pageContributions: entryLinksComponent.renderPageContributions(),
      clientRender: isOutsideContentStudio
    }
  }

  return {
    body: null,
    pageContributions: null
  }
}

const parseEntryLinks = (entryLinksContent) => {
  return entryLinksContent.map(({
    title, href, icon
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
      altText
    }
  })
}
