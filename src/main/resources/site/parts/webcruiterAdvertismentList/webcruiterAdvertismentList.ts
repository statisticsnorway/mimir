import { getComponent, getContent } from '/lib/xp/portal'
import { getPhrases } from '/lib/ssb/utils/language'
import {
  type WebcruiterAdvertismentListRssFeed,
  type WebcruiterAdvertismentListProps,
  NestedItemTag,
} from '/lib/types/partTypes/webcruiterAdvertismentList'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { fetchWebcruiterAdvertismentListRSSFeed } from '/services/webcruiterAdvertismentList/webcruiterAdvertismentList'

export function get(req: XP.Request): XP.Response {
  // TODO: Save to part cache
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

  const webcruiterAdvertismentListRSSFeedResponse = fetchWebcruiterAdvertismentListRSSFeed(
    config?.webcruiterRssUrl as string
  )
  const props: WebcruiterAdvertismentListProps = {
    title: config?.title ?? '',
    showingPhrase: phrases?.['publicationArchive.showing'],
    advertismentList: prepareAdvertistmentListData(
      webcruiterAdvertismentListRSSFeedResponse,
      content?.language as string
    ),
    professionalFieldPhrase: phrases?.['webcruiterAdvertismentList.professionalField'],
    locationPhrase: phrases?.['webcruiterAdvertismentList.location'],
    employmentTypePhrase: phrases?.['webcruiterAdvertismentList.employmentType'],
    applicationDeadlinePhrase: phrases?.['webcruiterAdvertismentList.applicationDeadline'],
  }
  return render('site/parts/webcruiterAdvertismentList/WebcruiterAdvertismentList', props, req, {
    body: `<section class="xp-part subject-article-list container-fluid"></section>`,
  })
}

function prepareAdvertistmentListData(webcruiterAdvertismentList: WebcruiterAdvertismentListRssFeed, language: string) {
  const webcruiterAdvertismentListItems = ensureArray(webcruiterAdvertismentList.rss.channel.item) ?? []

  const webcruiterAdvertismentListData = webcruiterAdvertismentListItems.map((item) => {
    return {
      positionTitle: item.title ?? '',
      positionAdvertismentUrl: item.link ?? '',
      professionalField: (item['wc:CompanyInfo'] as NestedItemTag)?.['wc:CompanyOrgName'] ?? '',
      location: item['wc:WorkplacePostaddress'] ?? '',
      employmentType:
        ((item['wc:EmploymentTypes'] as NestedItemTag)?.['wc:EmploymentType'] as NestedItemTag)?.[
          'wc:EmploymentTypeName'
        ] ?? '',
      applicationDeadline: item['wc:apply_within_date']
        ? formatDate(item['wc:apply_within_date'] as string, 'PPP', language)
        : '',
    }
  })
  return webcruiterAdvertismentListData
}
