import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/statreg/types'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { groupBy } from 'ramda'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { NextStatisticReleasesPartConfig } from './nextStatisticReleases-part-config'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../../lib/repo/statreg/statistics')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')
const {
  getComponent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')


const groupStatisticsByYear: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.year.toString()
})

const groupStatisticsByMonth: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.monthNumber.toString()
})

const groupStatisticsByDay: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.day.toString()
})

exports.get = function(req: Request): Response {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (): Response => renderPart()

export function renderPart(): Response {
  const part: Component<NextStatisticReleasesPartConfig> = getComponent()
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release))

  // group by year, then month, then day
  const groupedByYear: GroupedBy<PreparedStatistics> = groupStatisticsByYear(releasesPrepped)
  const groupedByMonthAndDay: GroupedBy<GroupedBy<PreparedStatistics>> = {}
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = {}
  Object.keys(groupedByYear).forEach((year) => {
    const tmpMonth: GroupedBy<PreparedStatistics> = groupStatisticsByMonth(forceArray(groupedByYear[year]))
    Object.keys(tmpMonth).forEach((month) => {
      groupedByMonthAndDay[month] = groupStatisticsByDay(forceArray(tmpMonth[month]))
    })
    groupedByYearMonthAndDay[year] = groupedByMonthAndDay
  })

  // render component
  const reactComponent: React4xpObject = new React4xp('NextStatisticReleases')
    .setProps({
      releases: groupedByYearMonthAndDay
    })
    .setId('nextStatisticsReleases')
    .uniqueId()

  // get config with number of statistics to show and title
  return {
    body: reactComponent.renderBody({
      body: `<div data-th-id="${reactComponent.react4xpId}"></div>`
    })
  }
}

function prepareRelease(release: StatisticInListing): PreparedStatistics {
  const preparedVariant: PreparedVariant = Array.isArray(release.variants) ? closestReleaseDate(release.variants) : formatVariant(release.variants)
  return {
    id: release.id,
    name: release.name,
    shortName: release.shortName,
    variant: preparedVariant
  }
}

function closestReleaseDate(variants: Array<VariantInListing>): PreparedVariant {
  const variantWithClosestPreviousRelease: VariantInListing = variants.reduce((earliestVariant, variant) => {
    const newDate: Date = new Date(variant.previousRelease)
    if (!variant || newDate < new Date(earliestVariant.previousRelease) ) return variant
    return earliestVariant
  })

  return formatVariant(variantWithClosestPreviousRelease)
}

function formatVariant(variant: VariantInListing): PreparedVariant {
  const date: Date = new Date(variant.previousRelease)
  return {
    id: variant.id,
    day: date.getDate(),
    monthNumber: date.getMonth(),
    year: date.getFullYear(),
    frequency: variant.frekvens
  }
}

function filterOnPreviousReleases(stats: Array<StatisticInListing>, numberOfReleases: number): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i: number = 0; releases.length < numberOfReleases; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() - i)
    const releasesOnThisDay: Array<StatisticInListing> = stats.filter((stat: StatisticInListing) => {
      return Array.isArray(stat.variants) ?
        stat.variants.find((variant: VariantInListing) => checkReleaseDate(variant, day)) :
        checkReleaseDate(stat.variants, day)
    })
    const trimmed: Array<StatisticInListing> = checkLimitAndTrim(releases, releasesOnThisDay, numberOfReleases)
    releases.push(...trimmed)
  }
  return releases
}

function checkLimitAndTrim(releases: Array<StatisticInListing>, releasesOnThisDay: Array<StatisticInListing>, count: number): Array<StatisticInListing> {
  if (releases.length + releasesOnThisDay.length > count) {
    const whereToSlice: number = (count - releases.length)
    return releasesOnThisDay.slice(0, whereToSlice)
  }
  return releasesOnThisDay
}

function checkReleaseDate(variant: VariantInListing, day: Date): boolean {
  return sameDay(new Date(variant.previousRelease), day)
}

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
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
}

interface GroupedBy<T> {
  [key: string]: Array<T> | T;
}


