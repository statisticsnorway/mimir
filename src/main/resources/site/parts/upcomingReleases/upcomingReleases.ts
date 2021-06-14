import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { Component } from 'enonic-types/portal'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { UpcomingReleasesPartConfig } from './upcomingReleases-part-config'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent,
  getComponent,
  processHtml,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')

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
    title: content.displayName,
    releases: groupedWithMonthNames,
    preface: component.config.preface ? processHtml({
      value: component.config.preface
    }) : undefined,
    language: currentLanguage,
    count,
    upcomingReleasesServiceUrl,
    buttonTitle
  }

  log.info('data OK ready to render')

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
  preface?: string;
  language: string;
  count: number;
  upcomingReleasesServiceUrl: string;
  buttonTitle: string;
}
