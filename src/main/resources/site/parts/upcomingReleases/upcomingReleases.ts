import { query, type Content } from '/lib/xp/content'
import { getContent, getComponent, processHtml, serviceUrl, sanitizeHtml } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type SubjectItem, getMainSubjects, getMainSubjectById } from '/lib/ssb/utils/subjectUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { format, addDays, isAfter, isBefore } from '/lib/vendor/dateFns'
import {
  type GroupedBy,
  type PreparedStatistics,
  type YearReleases,
  type Release,
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases,
  getAllReleases,
} from '/lib/ssb/utils/variantUtils'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { render } from '/lib/enonic/react4xp'

import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type UpcomingRelease } from '/site/content-types'

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function filterReleasesIntoArrays(contentReleases: Array<PreparedUpcomingRelease>, count: number) {
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  let start = new Date(new Date().getTime() + serverOffsetInMs)
  const limit = addDays(start, count)
  // Content releases has date at midnight, not correct publish time at 8 AM
  const publishTime = new Date(new Date().setHours(8) + serverOffsetInMs)

  if (isAfter(start, publishTime)) {
    // We show todays releases only until published at 8 AM
    start = addDays(start, 1)
  }
  const contentReleasesNextXDays: PreparedUpcomingRelease[] = []
  const contentReleasesAfterXDays: PreparedUpcomingRelease[] = []

  for (const release of contentReleases) {
    if (isAfter(new Date(release.date), start) && isBefore(new Date(release.date), limit)) {
      contentReleasesNextXDays.push(release)
    } else {
      contentReleasesAfterXDays.push(release)
    }
  }

  return { contentReleasesNextXDays, contentReleasesAfterXDays }
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const component = getComponent<XP.PartComponent.UpcomingReleases>()
  if (!component) throw Error('No part found')

  const currentLanguage: string = content.language ? content.language : 'nb'
  const count: number = parseInt(component.config.numberOfDays)
  const buttonTitle: string = localize({
    key: 'button.showAll',
    locale: currentLanguage,
  })
  const statisticsPageUrlText: string = localize({
    key: 'upcomingReleases.statisticsPageText',
    locale: currentLanguage,
  })
  const upcomingReleasesServiceUrl: string = serviceUrl({
    service: 'upcomingReleases',
  })
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, content.language === 'en' ? 'en' : 'nb')

  const groupedWithMonthNames: Array<YearReleases> = fromPartCache(req, `${content._id}-upcomingReleases`, () => {
    // Get statistics
    const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
    const allReleases: Array<Release> = getAllReleases(statistics)

    // All statistics from today and a number of days
    const releasesFiltered: Array<Release> = filterOnComingReleases(allReleases, count)

    // Choose the right variant and prepare the date in a way it works with the groupBy function
    const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: Release) =>
      prepareRelease(release, currentLanguage)
    )

    // group by year, then month, then day
    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
      groupStatisticsByYearMonthAndDay(releasesPrepped)

    return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  })

  const contentReleases: Array<PreparedUpcomingRelease> = query<Content<UpcomingRelease>>({
    start: 0,
    count: 500,
    query: `type = "${app.name}:upcomingRelease" AND language = "${currentLanguage}" AND data.date >= "${format(
      new Date(),
      'yyyy-MM-dd'
    )}"`,
  }).hits.map((r) => {
    const date: string = r.data.date
    const mainSubjectItem: SubjectItem | null = getMainSubjectById(allMainSubjects, r.data.mainSubject)
    const mainSubject: string = mainSubjectItem ? mainSubjectItem.title : ''
    const contentType: string = r.data.contentType
      ? localize({
          key: `contentType.${r.data.contentType}`,
          locale: currentLanguage,
        })
      : ''

    return {
      id: r._id,
      name: r.displayName,
      type: contentType,
      date: new Date(date).toISOString(),
      mainSubject: mainSubject,
      day: formatDate(date, 'd', currentLanguage) as string,
      month: formatDate(date, 'M', currentLanguage) as string,
      monthName: formatDate(date, 'MMM', currentLanguage) as string,
      year: formatDate(date, 'yyyy', currentLanguage) as string,
      upcomingReleaseLink: r.data.href ? sanitizeHtml(r.data.href) : '', // External URLs
    }
  })

  const { contentReleasesNextXDays, contentReleasesAfterXDays } = filterReleasesIntoArrays(contentReleases, count)

  const props: PartProps = {
    title: content.displayName,
    releases: groupedWithMonthNames,
    preface: component.config.preface
      ? processHtml({
          value: component.config.preface,
        })
      : undefined,
    language: currentLanguage,
    count,
    upcomingReleasesServiceUrl,
    buttonTitle,
    statisticsPageUrlText,
    contentReleasesNextXDays,
    contentReleasesAfterXDays,
  }

  return render('site/parts/upcomingReleases/upcomingReleases', props, req)
}

/*
 *  Interfaces
 */
interface PartProps {
  releases: Array<YearReleases>
  title?: string
  preface?: string
  language: string
  count: number
  upcomingReleasesServiceUrl: string
  buttonTitle: string
  statisticsPageUrlText: string
  contentReleasesNextXDays: Array<PreparedUpcomingRelease>
  contentReleasesAfterXDays: Array<PreparedUpcomingRelease>
}
interface PreparedUpcomingRelease {
  id: string
  name: string
  type: string
  date: string
  mainSubject: string
  day: string
  month: string
  monthName: string
  year: string
  upcomingReleaseLink?: string
}
