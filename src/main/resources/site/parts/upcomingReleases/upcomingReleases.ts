import { render } from '/lib/enonic/react4xp'
import { query, type Content } from '/lib/xp/content'
import type { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import type { GroupedBy, PreparedStatistics, YearReleases, Release } from '/lib/ssb/utils/variantUtils'
import type { UpcomingReleases as UpcomingReleasesPartConfig } from '.'
import type { UpcomingRelease } from '/site/content-types'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { formatDate, format } from '/lib/ssb/utils/dateUtils'
import { getContent, getComponent, processHtml, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { sanitizeHtml } from '/lib/xp/portal'

const { addMonthNames, groupStatisticsByYearMonthAndDay, prepareRelease, filterOnComingReleases, getUpcomingReleases } =
  __non_webpack_require__('/lib/ssb/utils/variantUtils')
const { getAllStatisticsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { getMainSubjects, getMainSubjectById } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const component = getComponent<UpcomingReleasesPartConfig>()
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
    const upComingReleases: Array<Release> = getUpcomingReleases(statistics)

    // All statistics published today, and fill up with previous releases.
    const releasesFiltered: Array<Release> = filterOnComingReleases(upComingReleases, count)

    // Choose the right variant and prepare the date in a way it works with the groupBy function
    const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: Release) =>
      prepareRelease(release, currentLanguage)
    )

    // group by year, then month, then day
    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
      groupStatisticsByYearMonthAndDay(releasesPrepped)

    // iterate and format month names
    // const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, currentLanguage)

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
    contentReleases,
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
  contentReleases: Array<PreparedUpcomingRelease>
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
