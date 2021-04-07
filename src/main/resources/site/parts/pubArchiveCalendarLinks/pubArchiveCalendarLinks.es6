const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  getComponent,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const React4xp = require('/lib/enonic/react4xp')

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

  if (part.config.pubArchiveUrl && part.config.statCalendarUrl) {
    const categoryLinksComponent = new React4xp('PubArchiveStatCalendar')
      .setProps({
        PublicationLink: part.config.pubArchiveUrl,
        CalendarLink: part.config.statCalendarUrl
      })
      .setId('CalendarLinks')
      .uniqueId()

    const body = render(view, {
      categoryId: categoryLinksComponent.react4xpId
    })

    return {
      body: categoryLinksComponent.renderBody({
        body
      }),
      pageContributions: categoryLinksComponent.renderPageContributions()
    }
  }
  return NO_LINKS_FOUND
}


