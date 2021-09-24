const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const view = resolve('./pubArchiveCalendarLinks.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const NO_LINKS_FOUND = {
  body: '',
  contentType: 'text/html'
}

const renderPart = (req) => {
  const part = getComponent()
  const page = getContent()
  const phrases = getPhrases(page)

  const PublicationText = phrases.publicationLinkText
  const CalendarText = phrases.statCalendarText

  if (part.config.pubArchiveUrl || part.config.statCalendarUrl) {
    const pubArchiveStatCalendarLinksComponent = new React4xp('PubArchiveStatCalendarLinks')
      .setProps({
        PublicationLink: part.config.pubArchiveUrl,
        PublicationText: PublicationText,
        CalendarLink: part.config.statCalendarUrl,
        CalendarText: CalendarText
      })
      .setId('CalendarLinks')
      .uniqueId()

    const body = render(view, {
      categoryId: pubArchiveStatCalendarLinksComponent.react4xpId
    })

    return {
      body: pubArchiveStatCalendarLinksComponent.renderBody({
        body
      }),
      pageContributions: pubArchiveStatCalendarLinksComponent.renderPageContributions()
    }
  }
  return NO_LINKS_FOUND
}


