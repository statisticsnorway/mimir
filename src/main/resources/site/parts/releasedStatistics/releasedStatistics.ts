__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import type { Content } from '/lib/xp/content'
import type { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { Component } from '/lib/xp/portal'
import type { ReleasedStatisticsPartConfig } from './releasedStatistics-part-config'
import type { YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { getAllStatisticsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const { checkLimitAndTrim } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { addMonthNames, getReleasesForDay, groupStatisticsByYearMonthAndDay, prepareStatisticRelease } =
  __non_webpack_require__('/lib/ssb/utils/variantUtils')

export function get(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

export function renderPart(req: XP.Request): RenderResponse {
  const content: Content = getContent()
  const currentLanguage: string = content.language ? content.language : 'nb'
  const part: Component<ReleasedStatisticsPartConfig> = getComponent()
  const deactivatePartCacheEnabled: boolean = isEnabled('deactivate-partcache-released-statistics', true, 'ssb')

  const groupedWithMonthNames: Array<YearReleases> = !deactivatePartCacheEnabled
    ? fromPartCache(req, `${content._id}-releasedStatistics`, () => {
        return getGroupedWithMonthNames(part, currentLanguage)
      })
    : getGroupedWithMonthNames(part, currentLanguage)

  const props: PartProps = {
    releases: groupedWithMonthNames,
    title: localize({
      key: 'newStatistics',
      locale: currentLanguage,
    }),
    language: currentLanguage,
  }
  return render('ReleasedStatistics', props, req)
}

function getGroupedWithMonthNames(
  part: Component<ReleasedStatisticsPartConfig>,
  currentLanguage: string
): Array<YearReleases> {
  // iterate and format month names
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8

  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) =>
    prepareStatisticRelease(release, currentLanguage)
  )

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasesPrepped)
  return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
}

export function filterOnPreviousReleases(
  stats: Array<StatisticInListing>,
  numberOfReleases: number
): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i = 0; releases.length < numberOfReleases; i++) {
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
  releases: Array<YearReleases>
  title: string
  language: string
}

interface PreparedStatistics {
  id: number
  name: string
  shortName: string
  variant: PreparedVariant
}

interface PreparedVariant {
  id: string
  day: number
  monthNumber: number
  year: number
  frequency: string
  period: string
}

interface GroupedBy<T> {
  [key: string]: Array<T> | T
}
