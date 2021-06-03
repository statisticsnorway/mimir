import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, VariantUtilsLib, YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { UpcomingReleasesPartConfig } from './upcomingReleases-part-config'
import { I18nLibrary } from 'enonic-types/i18n'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent,
  getComponent,
  serviceUrl
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases
}: VariantUtilsLib = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')
const {
  localize
}: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

let currentLanguage: string = ''

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const component: Component<UpcomingReleasesPartConfig> = getComponent()
  currentLanguage = content.language ? content.language : 'nb'
  const count: number = parseInt(component.config.numberOfDays)
  const isNotInEditMode: boolean = req.mode !== 'edit'
  const buttonTitle: string = localize({
    key: 'button.showMore',
    locale: currentLanguage
  })
  const upcomingReleasesServiceUrl: string = serviceUrl({
    service: 'upcomingReleases'
  })
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnComingReleases(releases, count)

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
    title: component.config.title ? component.config.title : undefined,
    language: currentLanguage,
    start: count,
    count,
    upcomingReleasesServiceUrl,
    buttonTitle
  }

  return React4xp.render('site/parts/upcomingReleases/upcomingReleases', props, req, {
    clientRender: isNotInEditMode
  })
}


/*
*  Interfaces
*/
interface PartProps {
  releases: Array<YearReleases>;
  title?: string;
  language: string;
  start: number;
  count: number;
  upcomingReleasesServiceUrl: string;
  buttonTitle: string;
}
