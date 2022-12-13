__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import type { Content, QueryDSL } from '/lib/xp/content'
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
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8

  //To get releases 08.00 before data from statreg is updated
  const queryNextReleaseTodayQuery: QueryDSL = {
    range: {
      field: 'data.nextRelease',
      from: 'dateTime',
      lte: stringToServerTime(),
    },
  } as unknown as QueryDSL

  const nextReleaseToday: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    queryNextReleaseTodayQuery,
    numberOfReleases
  )

  const previousReleasesQuery: QueryDSL = {
    range: {
      field: 'publish.from',
      type: 'dateTime',
      lte: new Date().toISOString(),
    },
  }

  const numberPreviousReleases: number =
    nextReleaseToday.length !== 0 ? numberOfReleases - nextReleaseToday.length : numberOfReleases

  const allPreviousStatisticVariantsFromRepo: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    previousReleasesQuery,
    numberPreviousReleases
  )

  const releasesPreppedNextReleaseToday: PreparedStatistics[] = nextReleaseToday.map((variant) => {
    return prepReleasesRepo(variant, parseISO(variant.data.nextRelease))
  })

  const releasesPreppedPreviousRelease: PreparedStatistics[] = allPreviousStatisticVariantsFromRepo.map((variant) => {
    return prepReleasesRepo(variant, parseISO(variant.data.previousRelease))
  })

  const releasedStatistics: PreparedStatistics[] =
    releasesPreppedNextReleaseToday.concat(releasesPreppedPreviousRelease)

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasedStatistics)
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

function prepReleasesRepo(variant: ContentLight<ReleaseVariant>, date: Date): PreparedStatistics {
  return {
    id: Number(variant.data.statisticId),
    name: variant.data.name,
    shortName: variant.data.shortName,
    variant: {
      id: variant.data.variantId,
      day: getDate(date),
      monthNumber: getMonth(date),
      year: getYear(date),
      frequency: variant.data.frequency,
      period: variant.data.period,
    },
  }
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
