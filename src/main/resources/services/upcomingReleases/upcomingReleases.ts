import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  getAllReleases,
} from '/lib/ssb/utils/variantUtils'
import { filterOnComingReleases } from '/lib/ssb/utils/filterReleasesUtils'

import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { GroupedBy, PreparedStatistics, Release, YearReleases } from '/lib/types/variants'

export const get = (req: XP.Request): XP.Response => {
  // Get statistics
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const allReleases: Array<Release> = getAllReleases(statistics)
  const count: number = req.params.count ? parseInt(req.params.count) : 2
  const showAll = !!(req.params.showAll && req.params.showAll === 'true')

  const language = req.params.language ? req.params.language : 'nb'
  const numberOfDays = showAll ? undefined : count
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  // All statistics from today and a number of days
  const releasesFiltered: Array<Release> = filterOnComingReleases(
    allReleases,
    serverOffsetInMs,
    numberOfDays,
    req.params.start
  )

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: Release) =>
    prepareRelease(release, language)
  )

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasesPrepped)

  // iterate and format month names
  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      releases: groupedWithMonthNames,
      count,
    },
  }
}
