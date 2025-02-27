import { getComponent, getContent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

import { fromPartCache } from '/lib/ssb/cache/partCache'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { renderError } from '/lib/ssb/error/error'
import {
  type WebcruiterAdvertisementListRssFeedResponse,
  type WebcruiterAdvertisementListProps,
  type NestedItemValue,
} from '/lib/types/partTypes/webcruiterAdvertisementList'
import { getPhrases } from '/lib/ssb/utils/language'

import { fetchWebcruiterAdvertisementListRSSFeed } from '/lib/ssb/parts/webcruiterAdvertisementList'

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

  const config = getComponent<XP.PartComponent.WebcruiterAdvertisementList>()?.config
  const phrases = getPhrases(content)

  const webcruiterAdvertisementListRSSFeedResponse = fromPartCache(
    req,
    `${content._id}-webcruiterAdvertisementList`,
    () => fetchWebcruiterAdvertisementListRSSFeed(config?.webcruiterRssUrl as string)
  )

  const props: WebcruiterAdvertisementListProps = {
    title: config?.title ?? '',
    showingPhrase: phrases?.['publicationArchive.showing'],
    advertisementList: prepareAdvertistmentListData(webcruiterAdvertisementListRSSFeedResponse),
    professionalFieldPhrase: phrases?.['webcruiterAdvertisementList.professionalField'],
    locationPhrase: phrases?.['webcruiterAdvertisementList.location'],
    employmentTypePhrase: phrases?.['webcruiterAdvertisementList.employmentType'],
    applicationDeadlinePhrase: phrases?.['webcruiterAdvertisementList.applicationDeadline'],
    noResultsPhrase: phrases?.['webcruiterAdvertisementList.noResults'],
  }
  return render('site/parts/webcruiterAdvertisementList/WebcruiterAdvertisementList', props, req, {
    body: `<section class="xp-part subject-article-list container-fluid"></section>`,
  })
}

function prepareAdvertistmentListData(
  webcruiterAdvertisementListRSSFeedResponse: WebcruiterAdvertisementListRssFeedResponse
) {
  const { status, message, body } = webcruiterAdvertisementListRSSFeedResponse
  if (status !== 200) {
    const errorMessage = `${status} ${message} - ${body}`
    log.error(errorMessage)
    return {
      errorMessage,
    }
  } else {
    const webcruiterAdvertisementListItems = ensureArray(body.rss?.channel?.item) ?? []
    const webcruiterAdvertisementListData = webcruiterAdvertisementListItems.map((item) => {
      return {
        positionTitle: item.title ?? '',
        positionAdvertisementUrl: item.link ?? '',
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
    return webcruiterAdvertisementListData
  }
}
