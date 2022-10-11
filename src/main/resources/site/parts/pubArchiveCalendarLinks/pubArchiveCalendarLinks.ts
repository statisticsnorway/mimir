import { Content } from '/lib/xp/content'
import { Phrases } from '../../../lib/types/language'
import {render} from '/lib/enonic/react4xp'
import { PubArchiveCalendarLinksPartConfig } from './pubArchiveCalendarLinks-part-config'

const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

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
    return render('PubArchiveStatCalendarLinks',
      {
        PublicationLink: config.pubArchiveUrl,
        PublicationText: PublicationText,
        CalendarLink: config.statCalendarUrl,
        CalendarText: CalendarText
      },
        req,
        {
          id: 'CalendarLinks',
          body: '<section class="xp-part part-pubarchive-link"></section>'
        })
  }
  return NO_LINKS_FOUND
}


