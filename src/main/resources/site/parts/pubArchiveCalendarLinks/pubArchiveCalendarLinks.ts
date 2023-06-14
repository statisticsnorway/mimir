import type { Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import type { PubArchiveCalendarLinks as PubArchiveCalendarLinksPartConfig } from '.'
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
  const config = getComponent<PubArchiveCalendarLinksPartConfig>()?.config
  if (!config) throw Error('No part found')

  const page = getContent()
  if (!page) throw Error('No page found')

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
