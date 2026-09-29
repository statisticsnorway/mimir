import { type Request, type Response } from '@enonic-types/core'
import { localize } from '/lib/xp/i18n'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  getAllReleases,
} from '/lib/ssb/utils/variantUtils'
import { filterOnComingReleases } from '/lib/ssb/utils/filterReleasesUtils'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'
import {
  fetchReleasesFromStatregApi,
  getAllStatisticsFromRepo,
  type ReleasesResponse,
} from '/lib/ssb/statreg/statistics'
import { type GroupedBy, type PreparedStatistics, type Release, type YearReleases } from '/lib/types/variants'
import { isEnabled } from '/lib/featureToggle'
import { addDays } from '/lib/vendor/dateFns'

export type StatregApiRelease = NonNullable<ReleasesResponse['releases']>[number]

export const get = (req: Request): Response => {
  const count: number = req.params.count ? parseInt(req.params.count.toString()) : 2
  const showAll = !!(req.params.showAll && req.params.showAll === 'true')
  const language = req.params.language ? req.params.language.toString() : 'nb'

  let groupedWithMonthNames: Array<YearReleases>
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const from = req.params.start ? new Date(req.params.start.toString()) : new Date()
    const releases =
      fetchReleasesFromStatregApi({
        sort: 'publish_time',
        approval_status: 'GODKJENT',
        publish_time_after: from.toISOString(),
        publish_time_before: showAll ? undefined : addDays(from, count).toISOString(),
      }) || []

    const releasesPrepped: Array<PreparedStatistics> = releases
      .map((release: StatregApiRelease) => prepareApiUpcomingReleases(release, language))
      .filter((release: PreparedStatistics | null): release is PreparedStatistics => release !== null)

    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
      groupStatisticsByYearMonthAndDay(releasesPrepped as Array<PreparedStatistics>)

    groupedWithMonthNames = addMonthNames(groupedByYearMonthAndDay, language)
  } else {
    // Get statistics
    const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
    const allReleases: Array<Release> = getAllReleases(statistics)
    const numberOfDays = showAll ? undefined : count
    const serverOffsetInMs: number = getServerOffsetInMs()
    // All statistics from today and a number of days
    const releasesFiltered: Array<Release> = filterOnComingReleases(
      allReleases,
      serverOffsetInMs,
      numberOfDays,
      req.params?.start?.toString()
    )

    // Choose the right variant and prepare the date in a way it works with the groupBy function
    const releasesPrepped: Array<PreparedStatistics | null> = releasesFiltered.map((release: Release) =>
      prepareRelease(release, language.toString())
    )

    // group by year, then month, then day
    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
      groupStatisticsByYearMonthAndDay(releasesPrepped as Array<PreparedStatistics>)

    // iterate and format month names
    groupedWithMonthNames = addMonthNames(groupedByYearMonthAndDay, language)
  }

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      releases: groupedWithMonthNames,
      count,
    },
  }
}

export function prepareApiUpcomingReleases(release: StatregApiRelease, language: string): PreparedStatistics | null {
  if (!release?.id || !release.statistic?.id) {
    return null
  }

  const periodPrefix = localize({
    key: 'period.generic',
    locale: language,
  })

  const period =
    language === 'en'
      ? (release.measuring_period?.title_en && periodPrefix.replace('{0}', release.measuring_period.title_en)) || ''
      : (release.measuring_period?.title && periodPrefix.replace('{0}', release.measuring_period.title)) || ''

  const preparedRelease = prepareRelease(
    {
      publishTime: release.publish_time || '',
      periodFrom: release.period_from || '',
      periodTo: release.period_to || '',
      frequency: release.frequency?.name || '',
      variantId: release.id.toString(),
      statisticId: release.statistic.id,
      shortName: release.statistic.shortname || '',
      statisticName: release.statistic.name || '',
      statisticNameEn: release.statistic.name_en || '',
      status: release.approval_status || '',
    },
    language,
    period || undefined
  )

  if (!preparedRelease) return null

  return preparedRelease
}
