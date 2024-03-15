import { getContent, getComponent } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { getPhrases } from '/lib/ssb/utils/language'

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
  const config = getComponent<XP.PartComponent.PubArchiveCalendarLinks>()?.config
  if (!config) throw Error('No part found')

  const page = getContent()
  if (!page) throw Error('No page found')

  const phrases = getPhrases(page) as Phrases

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
        hydrate: false,
      }
    )
  }
  return NO_LINKS_FOUND
}
