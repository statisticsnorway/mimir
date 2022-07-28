import { Content } from '/lib/xp/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { PubArchiveCalendarLinksPartConfig } from './pubArchiveCalendarLinks-part-config'

const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const view: ResourceKey = resolve('./pubArchiveCalendarLinks.html')

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

const NO_LINKS_FOUND: object = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: XP.Request): XP.Response {
  const config: PubArchiveCalendarLinksPartConfig = getComponent().config
  const page: Content = getContent()
  const phrases: Phrases = getPhrases(page)

  const PublicationText: string = phrases.publicationLinkText
  const CalendarText: string = phrases.statCalendarText

  if (config.pubArchiveUrl || config.statCalendarUrl) {
    const pubArchiveStatCalendarLinksComponent: React4xpObject = new React4xp('PubArchiveStatCalendarLinks')
      .setProps({
        PublicationLink: config.pubArchiveUrl,
        PublicationText: PublicationText,
        CalendarLink: config.statCalendarUrl,
        CalendarText: CalendarText
      })
      .setId('CalendarLinks')
      .uniqueId()

    const body: string = render(view, {
      categoryId: pubArchiveStatCalendarLinksComponent.react4xpId
    })

    return {
      body: pubArchiveStatCalendarLinksComponent.renderBody({
        body
      }),
      pageContributions: pubArchiveStatCalendarLinksComponent.renderPageContributions() as XP.PageContributions
    }
  }
  return NO_LINKS_FOUND
}


