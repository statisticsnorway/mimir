import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing } from '../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, VariantUtilsLib, YearReleases } from '../../lib/ssb/utils/variantUtils'


const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases
}: VariantUtilsLib = __non_webpack_require__( '/lib/ssb/utils/variantUtils')

const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../lib/ssb/statreg/statistics')

exports.get = (req: Request): Response => {
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const count: number = req.params.count ? parseInt(req.params.count) : 2
  const start: number = req.params.start ? parseInt(req.params.start) : 0
  const language: string = req.params.language ? req.params.language : 'nb'
  log.info('count: ' + count)
  log.info('start: ' + start)
  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnComingReleases(releases, count, start)
  log.info(JSON.stringify('releasesFiltered', null, 2))
  log.info(JSON.stringify(releasesFiltered, null, 2))
  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map(
    (release: StatisticInListing) => prepareRelease(release, language, 'nextRelease')
  )
  log.info(JSON.stringify('releasesPrepped', null, 2))
  log.info(JSON.stringify(releasesPrepped, null, 2))

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)
  log.info(JSON.stringify('groupedByYearMonthAndDay', null, 2))
  log.info(JSON.stringify(groupedByYearMonthAndDay, null, 2))

  // iterate and format month names
  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, language)
  log.info(JSON.stringify('groupedWithMonthNames', null, 2))
  log.info(JSON.stringify(groupedWithMonthNames, null, 2))

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      releases: groupedWithMonthNames,
      start,
      count
    }
  }
}

