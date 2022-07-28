import { StatisticInListing } from '../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, YearReleases, Release } from '../../lib/ssb/utils/variantUtils'

const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases,
  getUpcomingReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../lib/ssb/statreg/statistics')

exports.get = (req: XP.Request): XP.Response => {
  // Get statistics
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const upComingReleases: Array<Release> = getUpcomingReleases(statistics)
  const count: number = req.params.count ? parseInt(req.params.count) : 2
  const showAll: boolean = !!(req.params.showAll && req.params.showAll === 'true')

  const language: string = req.params.language ? req.params.language : 'nb'
  const numberOfDays: number = showAll ? getDaysToLatestRelease(upComingReleases) : count
  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<Release> = filterOnComingReleases(upComingReleases, numberOfDays, req.params.start)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: Release) => prepareRelease(release, language))

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

function getDaysToLatestRelease(upComingReleases: Array<Release> ): number {
  const lastUpcomingRelease: Release = upComingReleases[upComingReleases.length - 1]
  const today: Date = new Date()
  const releaseDate: Date = new Date(lastUpcomingRelease.publishTime)
  const diff: number = Math.abs(today.getTime() - releaseDate.getTime())
  const diffDays: number = Math.ceil(diff / (1000 * 3600 * 24))
  return diffDays
}

