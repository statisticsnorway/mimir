__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import { Content } from '/lib/xp/content'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { React4xp, React4xpResponse } from '/lib/enonic/react4xp'
import { Component } from '/lib/xp/portal'
import { ReleasedStatisticsPartConfig } from './releasedStatistics-part-config'
import { YearReleases } from '../../../lib/ssb/utils/variantUtils'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  checkLimitAndTrim
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

const {
  addMonthNames,
  getReleasesForDay,
  groupStatisticsByYearMonthAndDay,
  prepareStatisticRelease
} = __non_webpack_require__('/lib/ssb/utils/variantUtils')

exports.get = function(req: XP.Request): React4xpResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): React4xpResponse => renderPart(req)

export function renderPart(req: XP.Request): React4xpResponse {
  const content: Content = getContent()
  const currentLanguage: string = content.language ? content.language : 'nb'
  const part: Component<ReleasedStatisticsPartConfig> = getComponent()

  const groupedWithMonthNames: Array<YearReleases> = fromPartCache(req, `${content._id}-releasedStatistics`, () => {
    // iterate and format month names
    const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8

    // Get statistics
    const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

    // All statistics published today, and fill up with previous releases.
    const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)

    // Choose the right variant and prepare the date in a way it works with the groupBy function
    const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareStatisticRelease(release, currentLanguage))

    // group by year, then month, then day
    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)
    return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  })

  const props: PartProps = {
    releases: groupedWithMonthNames,
    title: localize({
      key: 'newStatistics',
      locale: currentLanguage
    }),
    language: currentLanguage
  }
  return React4xp.render('ReleasedStatistics', props, req)
}

export function filterOnPreviousReleases(stats: Array<StatisticInListing>, numberOfReleases: number): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i: number = 0; releases.length < numberOfReleases; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() - i)
    const releasesOnThisDay: Array<StatisticInListing> = getReleasesForDay(stats, day)
    const trimmed: Array<StatisticInListing> = checkLimitAndTrim(releases, releasesOnThisDay, numberOfReleases)
    releases.push(...trimmed)
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

interface PreparedStatistics {
  id: number;
  name: string;
  shortName: string;
  variant: PreparedVariant;
}

interface PreparedVariant {
  id: string;
  day: number;
  monthNumber: number;
  year: number;
  frequency: string;
  period: string;
}

interface GroupedBy<T> {
  [key: string]: Array<T> | T;
}


