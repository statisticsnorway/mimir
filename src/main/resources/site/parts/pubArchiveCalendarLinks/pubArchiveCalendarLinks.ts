import type { Content } from '/lib/xp/content'
import type { Phrases } from '../../../lib/types/language'
import { render } from '/lib/enonic/react4xp'
import type { PubArchiveCalendarLinksPartConfig } from './pubArchiveCalendarLinks-part-config'
import { getContent, getComponent } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

const NO_LINKS_FOUND: object = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response {
  const config: PubArchiveCalendarLinksPartConfig = getComponent().config
  const page: Content = getContent()
  const phrases: Phrases = getPhrases(page)

  const PublicationText: string = phrases.publicationLinkText
  const CalendarText: string = phrases.statCalendarText

  if (config.pubArchiveUrl || config.statCalendarUrl) {
    return render(
      'PubArchiveStatCalendarLinks',
      {
        PublicationLink: config.pubArchiveUrl,
        PublicationText: PublicationText,
        CalendarLink: config.statCalendarUrl,
        CalendarText: CalendarText,
      },
      req,
      {
        id: 'CalendarLinks',
        body: '<section class="xp-part part-pubarchive-link"></section>',
      }
    )
  }
  return NO_LINKS_FOUND
}
