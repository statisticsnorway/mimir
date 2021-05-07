import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PortalLibrary } from 'enonic-types/portal'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, VariantUtilsLib, YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { ArrayUtilsLib } from '../../../lib/ssb/utils/arrayUtils'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  checkLimitAndTrim
}: ArrayUtilsLib = __non_webpack_require__( '/lib/ssb/utils/arrayUtils')
const {
  addMonthNames,
  getReleasesForDay,
  groupStatisticsByYearMonthAndDay,
  prepareRelease
}: VariantUtilsLib = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')


exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

let currentLanguage: string = ''

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  currentLanguage = content.language ? content.language : 'nb'

  const daysInTheFuture: number = 20

  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnComingReleases(releases, daysInTheFuture)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map(
    (release: StatisticInListing) => prepareRelease(release, currentLanguage, 'nextRelease')
  )

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)

  // iterate and format month names
  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  const props: PartProps = {
    releases: groupedWithMonthNames,
    title: 'Title',
    language: currentLanguage
  }

  return React4xp.render('site/parts/comingReleases/comingReleases', props, req)
}


function filterOnComingReleases(stats: Array<StatisticInListing>, daysInTheFuture: number): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i: number = 0; i < daysInTheFuture; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() + i)
    log.info('get releases for date: ' + day)
    const releasesOnThisDay: Array<StatisticInListing> = getReleasesForDay(stats, day, 'nextRelease')
    releases.push(...releasesOnThisDay)
  }
  return releases
}


/*
*  Interfaces
*/
interface PartProps {
  releases: Array<YearReleases>;
  title: string;
  language: string;
}
