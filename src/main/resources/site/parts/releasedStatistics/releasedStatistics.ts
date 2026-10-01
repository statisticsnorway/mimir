import '/lib/ssb/polyfills/nashorn'

import { type Request, type Response } from '@enonic-types/core'
import { type QueryDsl } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { addMonthNames, groupStatisticsByYearMonthAndDay } from '/lib/ssb/utils/variantUtils'
import { render } from '/lib/enonic/react4xp'
import {
  type ContentLight,
  type Release as ReleaseVariant,
  getStatisticVariantsFromRepo,
} from '/lib/ssb/repo/statisticVariant'
import { stringToServerTime } from '/lib/ssb/utils/dateUtils'
import { parseISO } from '/lib/vendor/dateFns'
import { renderError } from '/lib/ssb/error/error'
import { type PreparedStatistics, type YearReleases } from '/lib/types/variants'
import { type GroupedBy, type ReleasedStatisticsProps } from '/lib/types/partTypes/releasedStatistics'
import { isEnabled } from '/lib/featureToggle'
import { fetchReleasesFromStatregApi } from '/lib/ssb/statreg/statistics'
import { prepareApiUpcomingReleases, type StatregApiRelease } from '/services/upcomingReleases/upcomingReleases'
import { type ReleasedStatistics as ReleasedStatisticsPartConfig } from '.'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

export function renderPart(req: Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const currentLanguage: string = content.language ? content.language : 'nb'
  const config = getComponent<XP.PartComponent.ReleasedStatistics>()?.config
  if (!config) throw Error('No part found')

  const groupedWithMonthNames: Array<YearReleases> = getGroupedWithMonthNames(config, currentLanguage)

  const props: ReleasedStatisticsProps = {
    releases: groupedWithMonthNames,
    title: localize({
      key: 'newStatistics',
      locale: currentLanguage,
    }),
    language: currentLanguage,
  }
  return render('ReleasedStatistics', props, req, {
    hydrate: false,
  })
}

function getGroupedWithMonthNames(config: ReleasedStatisticsPartConfig, currentLanguage: string): Array<YearReleases> {
  const numberOfReleases: number = config.numberOfStatistics ? parseInt(config.numberOfStatistics) : 8

  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const startOfToday = stringToServerTime()
    startOfToday.setHours(0, 0, 0, 0)

    const nextReleaseToday: Array<StatregApiRelease> = latestPerStatistic(
      fetchReleasesFromStatregApi({
        sort: '-publish_time',
        approval_status: 'GODKJENT',
        publish_time_after: startOfToday.toISOString(),
        publish_time_before: stringToServerTime().toISOString(),
      }) || [],
      numberOfReleases
    )

    const numberPreviousReleases: number =
      nextReleaseToday.length !== 0 ? numberOfReleases - nextReleaseToday.length : numberOfReleases

    const previousReleases: Array<StatregApiRelease> =
      numberPreviousReleases > 0
        ? latestPerStatistic(
            fetchReleasesFromStatregApi({
              sort: '-publish_time',
              approval_status: 'GODKJENT',
              publish_time_before: startOfToday.toISOString(),
            }) || [],
            numberPreviousReleases
          )
        : []

    const releasedStatistics: PreparedStatistics[] = nextReleaseToday
      .concat(previousReleases)
      .map((release: StatregApiRelease) => prepareApiUpcomingReleases(release, currentLanguage))
      .filter((release: PreparedStatistics | null): release is PreparedStatistics => release !== null)

    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> =
      groupStatisticsByYearMonthAndDay(releasedStatistics)
    return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  }

  //To get releases 08.00 before data from statreg is updated
  const nextReleaseToday: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    currentLanguage,
    {
      range: {
        field: 'data.nextRelease',
        from: 'dateTime',
        lte: stringToServerTime(),
      },
    } as QueryDsl,
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

function latestPerStatistic(releases: Array<StatregApiRelease>, count: number): Array<StatregApiRelease> {
  const seen: Record<string, boolean> = {}
  const unique: Array<StatregApiRelease> = []
  releases.forEach((release) => {
    const key = release.statistic?.shortname || (release.statistic?.id != null ? String(release.statistic.id) : '')
    if (!key || seen[key] || unique.length >= count) return
    seen[key] = true
    unique.push(release)
  })
  return unique
}

function prepReleases(variant: ContentLight<ReleaseVariant>, date: Date, periodRelease: string): PreparedStatistics {
  return {
    id: Number(variant.data.statisticId),
    name: variant.data.name,
    shortName: variant.data.shortName,
    variant: {
      id: variant.data.variantId,
      day: date.getDate(),
      monthNumber: date.getMonth(),
      year: date.getFullYear(),
      frequency: variant.data.frequency,
      period: periodRelease,
    },
  }
}
