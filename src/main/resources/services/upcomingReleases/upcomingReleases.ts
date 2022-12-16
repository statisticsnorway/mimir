import { YearReleases } from '../../lib/ssb/utils/variantUtils'
import { getUpcomingReleasesResults } from '/lib/ssb/parts/upcomingReleases'

const { addMonthNames, groupStatisticsByYearMonthAndDay } = __non_webpack_require__('/lib/ssb/utils/variantUtils')

exports.get = (req: XP.Request): XP.Response => {
  const count: number | undefined = req.params.count ? parseInt(req.params.count) : undefined
  const language: string = req.params.language ? req.params.language : 'nb'
  const upcomingReleases = getUpcomingReleasesResults(req, count, language).upcomingReleases

  const groupedByYearMonthAndDay = groupStatisticsByYearMonthAndDay(upcomingReleases)

  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      total: upcomingReleases.length,
      releases: groupedWithMonthNames,
      count,
    },
  }
}
