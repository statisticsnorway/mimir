import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing } from '../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, YearReleases } from '../../lib/ssb/utils/variantUtils'

const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../lib/ssb/statreg/statistics')

exports.get = (req: Request): Response => {
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const count: number = req.params.count ? parseInt(req.params.count) : 2

  const language: string = req.params.language ? req.params.language : 'nb'
  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnComingReleases(releases, count, req.params.start)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map(
    (release: StatisticInListing) => prepareRelease(release, language, 'nextRelease')
  )

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)

  // iterate and format month names
  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      releases: groupedWithMonthNames,
      count
    }
  }
}

