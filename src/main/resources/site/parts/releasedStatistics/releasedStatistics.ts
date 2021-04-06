
__non_webpack_require__('/lib/polyfills/nashorn')
import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/statreg/types'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { groupBy } from 'ramda'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { ReleasedStatisticsPartConfig } from './releasedStatistics-part-config'
import { I18nLibrary } from 'enonic-types/i18n'
// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  localize
}: I18nLibrary = __non_webpack_require__( '/lib/xp/i18n')

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
  getWeek
} = __non_webpack_require__('/lib/ssb/utils')
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
  const part: Component<ReleasedStatisticsPartConfig> = getComponent()
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
  const reactComponent: React4xpObject = new React4xp('ReleasedStatistics')
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
    if (!variant || newDate > new Date(earliestVariant.previousRelease) ) return variant
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
    frequency: variant.frekvens,
    period: calculatePeriode(variant)
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

function calculatePeriode(variant: VariantInListing): string {
  switch (variant.frekvens) {
  case 'År':
    return calculateYear(variant)
  case 'Halvår':
    return calcualteHalfYear(variant)
  case 'Termin':
    return calculateTerm(variant)
  case 'Kvartal':
    return calculateQuarter(variant)
  case 'Måned':
    return calculateMonth(variant)
  case 'Uke':
    return calculateWeek(variant)
  default:
    return calculateEveryXYear(variant)
  }
}

function calculateEveryXYear(variant: VariantInListing) {
  const dateFrom: Date = new Date(variant.previousFrom)
  const dateTo: Date = new Date(variant.previousTo)
  const yearFrom: number = dateFrom.getFullYear()
  const yearTo: number = dateTo.getFullYear()

  if (yearFrom !== yearTo) {
    return localize({
      key: 'period.generic',
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    // spesialtilfelle hvis periode-fra og periode-til er i samme år
    return localize({
      key: 'period.generic',
      values: [yearTo.toString()]
    })
  }
}

function calculateYear(variant: VariantInListing) {
  const dateFrom: Date = new Date(variant.previousFrom)
  const dateTo: Date = new Date(variant.previousTo)
  const yearFrom: number = dateFrom.getFullYear()
  const yearTo: number = dateTo.getFullYear()
  if ( (yearFrom + 1) === yearTo &&
      dateFrom.getDate() !== 1 &&
      dateFrom.getMonth() !== 0 &&
      dateTo.getDate() !== 31 &&
      dateTo.getMonth() !== 11) {
    // spesialtilfelle hvis periode-fra og periode-til er kun ett år mellom og startdato ikke er 01.01
    return localize({
      key: 'period.generic',
      values: [`${yearFrom.toString()}/${yearTo.toString()}`]
    })
  } else if (yearFrom !== yearTo ) {
    // spesialtilfelle hvis periode-fra og periode-til er i ulike år
    return localize({
      key: 'period.generic',
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    return localize({
      key: 'period.generic',
      values: [yearTo.toString()]
    })
  }
}

function calcualteHalfYear(variant: VariantInListing) {
  const date: Date = new Date(variant.previousFrom)
  const fromMonth: number = new Date(variant.previousFrom).getMonth() + 1
  const halfyear: number = Math.ceil(fromMonth / 6)
  return localize({
    key: 'period.halfyear',
    values: [halfyear.toString(), date.getFullYear().toString()]
  })
}

function calculateTerm(variant: VariantInListing): string {
  const date: Date = new Date(variant.previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const termin: number = Math.ceil(fromMonth / 6)
  return localize({
    key: 'period.termin',
    values: [termin.toString(), date.getFullYear().toString()]
  })
}

function calculateQuarter(variant: VariantInListing) {
  const date: Date = new Date(variant.previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const quarter: number = Math.ceil(fromMonth / 3)
  return localize({
    key: 'period.quarter',
    values: [quarter.toString(), date.getFullYear().toString()]
  })
}

function calculateMonth(variant: VariantInListing) {
  const monthName: string = moment(variant.previousFrom).format('MMMM')
  const year: string = moment(variant.previousFrom).format('YYYY')
  return localize({
    key: 'period.month',
    values: [monthName, year]
  })
}

function calculateWeek(variant: VariantInListing) {
  const date: Date = new Date(variant.previousFrom)
  return localize({
    key: 'period.week',
    values: [getWeek(date).toString(), date.getFullYear().toString()]
  })
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


