import { type Request } from '@enonic-types/core'
import { query, type Content } from '/lib/xp/content'
import { getContent, getComponent, processHtml, serviceUrl, sanitizeHtml } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import {
  type GroupedBy,
  type PreparedStatistics,
  type YearReleases,
  type Release,
  type PreparedContentRelease,
} from '/lib/types/variants'
import { getMainSubjects, getMainSubjectById } from '/lib/ssb/utils/subjectUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'
import { addDays, format } from '/lib/vendor/dateFns'
import {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  getAllReleases,
} from '/lib/ssb/utils/variantUtils'
import { filterReleasesIntoArrays, filterOnComingReleases } from '/lib/ssb/utils/filterReleasesUtils'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { render } from '/lib/enonic/react4xp'
import { isEnabled } from '/lib/featureToggle'

import {
  fetchReleasesFromStatregApi,
  getAllStatisticsFromRepo,
  type StatregApiRelease,
} from '/lib/ssb/statreg/statistics'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type UpcomingReleasesProps } from '/lib/types/partTypes/upcomingReleases'
import { type SubjectItem } from '/lib/types/subject'
import { type UpcomingRelease } from '/site/content-types'

export function get(req: Request) {
  return renderPart(req)
}

export function preview(req: Request) {
  return renderPart(req)
}

function renderPart(req: Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const component = getComponent<XP.PartComponent.UpcomingReleases>()
  if (!component) throw Error('No part found')

  const currentLanguage: string = content.language ? content.language : 'nb'
  const count: number = parseInt(component.config.numberOfDays)
  const serverOffsetInMs: number = getServerOffsetInMs()

  const buttonTitle: string = localize({
    key: 'button.showAll',
    locale: currentLanguage,
  })
  const upcomingReleasesServiceUrl: string = serviceUrl({
    service: 'upcomingReleases',
  })
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, content.language === 'en' ? 'en' : 'nb')

  let groupedWithMonthNames: Array<YearReleases>
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const from = new Date()
    const releases =
      fetchReleasesFromStatregApi({
        sort: 'publish_time',
        approval_status: 'GODKJENT',
        publish_time_after: from.toISOString(),
        publish_time_before: addDays(from, count).toISOString(),
      }) || []

    const releasesPrepped: Array<PreparedStatistics> = releases
      .map((release: StatregApiRelease) => prepareApiRelease(release, currentLanguage))
      .filter((release: PreparedStatistics | null): release is PreparedStatistics => release !== null)

    groupedWithMonthNames = addMonthNames(groupStatisticsByYearMonthAndDay(releasesPrepped), currentLanguage)
  } else {
    groupedWithMonthNames = fromPartCache(req, `${content._id}-upcomingReleases`, () => {
      // Get statistics
      const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
      const allReleases: Array<Release> = getAllReleases(statistics)

      // All statistics from today and a number of days
      const releasesFiltered: Array<Release> = filterOnComingReleases(allReleases, serverOffsetInMs, count)

      // Choose the right variant and prepare the date in a way it works with the groupBy function
      const releasesPrepped: Array<PreparedStatistics | null> =
        releasesFiltered.map((release: Release) => prepareRelease(release, currentLanguage)) ?? []

      // group by year, then month, then day
      const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
        groupStatisticsByYearMonthAndDay(releasesPrepped as Array<PreparedStatistics>)

      return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
    })
  }

  const contentReleases: Array<PreparedContentRelease> = query<Content<UpcomingRelease>>({
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

  const { contentReleasesNextXDays, contentReleasesAfterXDays } = filterReleasesIntoArrays(
    contentReleases,
    count,
    serverOffsetInMs,
    new Date()
  )

  const props: UpcomingReleasesProps = {
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
    contentReleasesNextXDays,
    contentReleasesAfterXDays,
  }

  return render('site/parts/upcomingReleases/upcomingReleases', props, req)
}

function prepareApiRelease(release: StatregApiRelease, language: string): PreparedStatistics | null {
  if (
    release.id == null ||
    !release.publish_time ||
    !release.period_from ||
    !release.period_to ||
    !release.statistic ||
    release.statistic.id == null ||
    !release.statistic.shortname ||
    !release.statistic.name ||
    !release.frequency ||
    !release.frequency.name
  ) {
    return null
  }

  const preparedRelease = prepareRelease(
    {
      publishTime: release.publish_time,
      periodFrom: release.period_from,
      periodTo: release.period_to,
      frequency: release.frequency.name,
      variantId: release.id.toString(),
      statisticId: release.statistic.id,
      shortName: release.statistic.shortname,
      statisticName: release.statistic.name,
      statisticNameEn: release.statistic.name_en || release.statistic.name,
      status: release.approval_status || '',
    },
    language
  )

  if (!preparedRelease) {
    return null
  }

  const period =
    language === 'en'
      ? release.measuring_period?.title_en || release.measuring_period?.title
      : release.measuring_period?.title || release.measuring_period?.title_en

  if (period) {
    preparedRelease.variant.period = period
  }

  if (release.revision?.code === 'R') {
    preparedRelease.variant.period += language === 'en' ? ', revision' : ', revisjon'
  }

  return preparedRelease
}
