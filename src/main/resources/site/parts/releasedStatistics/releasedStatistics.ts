__non_webpack_require__('/lib/ssb/polyfills/nashorn')

import type { Content, QueryDSL } from '/lib/xp/content'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { ReleasedStatistics as ReleasedStatisticsPartConfig } from '.'
import type { YearReleases } from '/lib/ssb/utils/variantUtils'
import { type Component, getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { default as parseISO } from 'date-fns/parseISO'
import { default as getMonth } from 'date-fns/getMonth'
import { default as getYear } from 'date-fns/getYear'
import { default as getDate } from 'date-fns/getDate'
import { stringToServerTime } from '/lib/ssb/utils/dateUtils'

const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const { addMonthNames, groupStatisticsByYearMonthAndDay } = __non_webpack_require__('/lib/ssb/utils/variantUtils')

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
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8

  //To get releases 08.00 before data from statreg is updated
  const nextReleaseToday: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    {
      range: {
        field: 'data.nextRelease',
        from: 'dateTime',
        lte: stringToServerTime(),
      },
    } as unknown as QueryDSL,
    numberOfReleases
  )

  const numberPreviousReleases: number =
    nextReleaseToday.length !== 0 ? numberOfReleases - nextReleaseToday.length : numberOfReleases

  const allPreviousStatisticVariantsFromRepo: ContentLight<ReleaseVariant>[] =
    numberPreviousReleases > 0
      ? getStatisticVariantsFromRepo(
          currentLanguage,
          {
            range: {
              field: 'publish.from',
              type: 'dateTime',
              lte: new Date().toISOString(),
            },
          },
          numberPreviousReleases
        )
      : []

  const releasesPreppedNextReleaseToday: PreparedStatistics[] = nextReleaseToday.map((variant) => {
    return prepReleases(variant, parseISO(variant.data.nextRelease), variant.data.nextPeriod)
  })

  const releasesPreppedPreviousRelease: PreparedStatistics[] = allPreviousStatisticVariantsFromRepo.map((variant) => {
    return prepReleases(variant, parseISO(variant.data.previousRelease), variant.data.period)
  })

  const releasedStatistics: PreparedStatistics[] =
    releasesPreppedNextReleaseToday.concat(releasesPreppedPreviousRelease)

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
    groupStatisticsByYearMonthAndDay(releasedStatistics)
  return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
}

function prepReleases(
  variant: ContentLight<ReleaseVariant>,
  date: Date,
  periodRelease: string | undefined
): PreparedStatistics {
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
      period: periodRelease ? periodRelease.toLowerCase() : '',
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
