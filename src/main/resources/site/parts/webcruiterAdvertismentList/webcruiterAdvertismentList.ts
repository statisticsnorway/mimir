import { getComponent, getContent } from '/lib/xp/portal'
import { getPhrases } from '/lib/ssb/utils/language'
import {
  type WebcruiterAdvertismentListRssFeedResponse,
  type WebcruiterAdvertismentListProps,
  type NestedItemValue,
} from '/lib/types/partTypes/webcruiterAdvertismentList'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { fromPartCache } from '/lib/ssb/cache/partCache'

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

  const webcruiterAdvertismentListRSSFeedResponse = fromPartCache(
    req,
    `${content._id}-webcruiterAdvertismentList`,
    () => fetchWebcruiterAdvertismentListRSSFeed(config?.webcruiterRssUrl as string)
  )

  const props: WebcruiterAdvertismentListProps = {
    title: config?.title ?? '',
    showingPhrase: phrases?.['publicationArchive.showing'],
    advertismentList: prepareAdvertistmentListData(webcruiterAdvertismentListRSSFeedResponse),
    professionalFieldPhrase: phrases?.['webcruiterAdvertismentList.professionalField'],
    locationPhrase: phrases?.['webcruiterAdvertismentList.location'],
    employmentTypePhrase: phrases?.['webcruiterAdvertismentList.employmentType'],
    applicationDeadlinePhrase: phrases?.['webcruiterAdvertismentList.applicationDeadline'],
    noResultsPhrase: phrases?.['webcruiterAdvertismentList.noResults'],
  }
  return render('site/parts/webcruiterAdvertismentList/WebcruiterAdvertismentList', props, req, {
    body: `<section class="xp-part subject-article-list container-fluid"></section>`,
  })
}

function prepareAdvertistmentListData(
  webcruiterAdvertismentListRSSFeedResponse: WebcruiterAdvertismentListRssFeedResponse
) {
  const { status, message, body } = webcruiterAdvertismentListRSSFeedResponse
  if (status !== 200) {
    const errorMessage = `${status} ${message} - ${body}`
    log.error(errorMessage)
    return {
      errorMessage,
    }
  } else {
    const webcruiterAdvertismentListItems = ensureArray(body.rss?.channel?.item) ?? []
    const webcruiterAdvertismentListData = webcruiterAdvertismentListItems.map((item) => {
      return {
        positionTitle: item.title ?? '',
        positionAdvertismentUrl: item.link ?? '',
        professionalField: (item['wc:CompanyInfo'] as NestedItemValue)?.['wc:CompanyOrgName'] ?? '',
        location: item['wc:WorkplacePostaddress'] ?? '',
        employmentType:
          ((item['wc:EmploymentTypes'] as NestedItemValue)?.['wc:EmploymentType'] as NestedItemValue)?.[
            'wc:EmploymentTypeName'
          ] ?? '',
        applicationDeadline: item['wc:apply_within_date']
          ? formatDate(item['wc:apply_within_date'] as string, 'dd.MM.yy')
          : '',
      }
    })
    return webcruiterAdvertismentListData
  }
}
