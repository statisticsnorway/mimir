__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import type { Content, QueryDSL } from '/lib/xp/content'
//import { type Content, get, query, QueryDSL, QueryResponse } from '/lib/xp/content'
import type { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { ReleasedStatistics as ReleasedStatisticsPartConfig } from '.'
import type { YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { type Component, getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { parseISO, getMonth, getYear, getDate } from 'date-fns'
import { stringToServerTime } from '../../../lib/ssb/utils/dateUtils'

const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { getAllStatisticsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const { checkLimitAndTrim } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { addMonthNames, getReleasesForDay, groupStatisticsByYearMonthAndDay, prepareStatisticRelease } =
  __non_webpack_require__('/lib/ssb/utils/variantUtils')

export function get(req: XP.Request): RenderResponse | XP.Response {
  try {
    const start: number = new Date().getTime()
    const render: XP.Response = renderPart(req)
    log.info(`renderPart:  ${new Date().getTime() - start}`)

    return render //renderPart(req)
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
  const startGroupMnd: number = new Date().getTime()
  const groupedWithMonthNames: Array<YearReleases> = !deactivatePartCacheEnabled
    ? fromPartCache(req, `${content._id}-releasedStatistics`, () => {
        return getGroupedWithMonthNames(part, currentLanguage)
      })
    : getGroupedWithMonthNamesRepo(part, currentLanguage)

  log.info(`groupedWithMonthNames total:  ${new Date().getTime() - startGroupMnd}`)

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

function getGroupedWithMonthNamesRepo(
  part: Component<ReleasedStatisticsPartConfig>,
  currentLanguage: string
): Array<YearReleases> {
  // iterate and format month names
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8
  log.info('servertime: ' + stringToServerTime())
  log.info('new Date(: ' + new Date())

  /* const queryNextReleaseToday: QueryDSL = {
    range: {
      field: 'data.nextRelease',
      type: 'da',
      lte: new Date().toISOString,
    },
  }

  const todayFromRepo: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    queryNextReleaseToday,
    numberOfReleases
  )

  log.info('Varianter idag: ' + JSON.stringify(todayFromRepo, null, 4)) */

  const query: QueryDSL = {
    range: {
      field: 'publish.from',
      type: 'dateTime',
      lte: new Date().toISOString(),
    },
  }

  const allPreviousStatisticVariantsFromRepo: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    query,
    numberOfReleases
  )

  const releasesPrepped: PreparedStatistics[] = allPreviousStatisticVariantsFromRepo.map((variant) => {
    const date: Date = variant.data.previousRelease ? parseISO(variant.data.previousRelease) : new Date('01.01.3000') //parseISO(release.publishTime)
    return {
      id: Number(variant.data.statisticId),
      name: variant.data.name,
      shortName: variant.data.shortName,
      type: 'statistikk',
      variant: {
        id: variant.data.variantId,
        day: getDate(date),
        monthNumber: getMonth(date),
        year: getYear(date),
        frequency: variant.data.frequency,
        period: variant.data.period,
      },
    }
  })

  //log.info('releasedPreppedRepo: ' + JSON.stringify(releasesPrepped, null, 4))

  // group by year, then month, then day
  const startreleaseGroup: number = new Date().getTime()
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasesPrepped)
  log.info(`groupStatisticsByYearMonthAndDay:  ${new Date().getTime() - startreleaseGroup}`)
  return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
}

function getGroupedWithMonthNames(
  part: Component<ReleasedStatisticsPartConfig>,
  currentLanguage: string
): Array<YearReleases> {
  // iterate and format month names
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8

  // Get statistics
  const startreleases: number = new Date().getTime()
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()
  log.info(`getAllStatisticsFromRepo:  ${new Date().getTime() - startreleases}`)

  // All statistics published today, and fill up with previous releases.
  const startreleasesFiltered: number = new Date().getTime()
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)
  log.info(`filterOnPreviousReleases:  ${new Date().getTime() - startreleasesFiltered}`)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const startreleasesPrep: number = new Date().getTime()
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) =>
    prepareStatisticRelease(release, currentLanguage)
  )
  //log.info('releasesPrepped: ' + JSON.stringify(releasesPrepped, null, 4))
  log.info(`prepareStatisticRelease:  ${new Date().getTime() - startreleasesPrep}`)

  // group by year, then month, then day
  const startreleaseGroup: number = new Date().getTime()
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasesPrepped)
  log.info(`groupStatisticsByYearMonthAndDay:  ${new Date().getTime() - startreleaseGroup}`)
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
