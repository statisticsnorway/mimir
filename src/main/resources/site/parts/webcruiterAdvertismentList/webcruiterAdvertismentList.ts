import { getComponent, getContent } from '/lib/xp/portal'
import { getPhrases } from '/lib/ssb/utils/language'
import { type WebcruiterAdvertismentListProps } from '/lib/types/partTypes/webcruiterAdvertismentList'

import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { fetchWebcruiterAdvertismentListRSSFeed } from '/services/webcruiterAdvertismentList/webcruiterAdvertismentList'

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

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const config = getComponent<XP.PartComponent.WebcruiterAdvertismentList>()?.config
  const phrases = getPhrases(content)

  fetchWebcruiterAdvertismentListRSSFeed(config?.webcruiterRssUrl as string)
  const props: WebcruiterAdvertismentListProps = {
    title: config?.title ?? '',
    showingPhrase: phrases?.['publicationArchive.showing'],
    professionalFieldPhrase: phrases?.['webcruiterAdvertismentList.professionalField'],
    locationPhrase: phrases?.['webcruiterAdvertismentList.location'],
    employmentTypePhrase: phrases?.['webcruiterAdvertismentList.employmentType'],
    applicationDeadlinePhrase: phrases?.['webcruiterAdvertismentList.applicationDeadline'],
  }
  return render('site/parts/webcruiterAdvertismentList/WebcruiterAdvertismentList', props, req, {
    body: `<section class="xp-part subject-article-list container-fluid"></section>`,
  })
}
