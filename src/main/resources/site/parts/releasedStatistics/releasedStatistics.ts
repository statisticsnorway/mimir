import { Content } from 'enonic-types/content'

__non_webpack_require__('/lib/polyfills/nashorn')
import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
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
  getComponent,
  getContent
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
let currentLanguage: string = ''
export function renderPart(): Response {
  const content: Content = getContent()
  currentLanguage = content.language ? content.language : 'nb'


  const part: Component<ReleasedStatisticsPartConfig> = getComponent()
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release, currentLanguage))

  // group by year, then month, then day
  const groupedByYear: GroupedBy<PreparedStatistics> = groupStatisticsByYear(releasesPrepped)
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = {}
  Object.keys(groupedByYear).forEach((year) => {
    const groupedByMonthAndDay: GroupedBy<GroupedBy<PreparedStatistics>> = {}
    const tmpMonth: GroupedBy<PreparedStatistics> = groupStatisticsByMonth(forceArray(groupedByYear[year]))
    Object.keys(tmpMonth).map((month) => {
      groupedByMonthAndDay[month] = groupStatisticsByDay(forceArray(tmpMonth[month]))
    })
    groupedByYearMonthAndDay[year] = groupedByMonthAndDay
  })

  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, currentLanguage)

  // render component
  const reactComponent: React4xpObject = new React4xp('ReleasedStatistics')
    .setProps({
      releases: groupedWithMonthNames,
      title: localize({
        key: 'newStatistics',
        locale: currentLanguage === 'nb' ? 'no' : currentLanguage
      }),
      language: currentLanguage
    })
    .setId('nextStatisticsReleases')
    .uniqueId()

  // get config with number of statistics to show and title
  return {
    body: reactComponent.renderBody({
      body: `<div id="${reactComponent.react4xpId}"></div>`
    })
  }
}

function addMonthNames(groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>>, language: string): Array<YearReleases> {
  moment.locale(language)
  return Object.keys(groupedByYearMonthAndDay).map((year) => {
    const tmpYear: GroupedBy<GroupedBy<PreparedStatistics>> = groupedByYearMonthAndDay[year] as GroupedBy<GroupedBy<PreparedStatistics>>
    const monthReleases: Array<MonthReleases> = Object.keys(tmpYear).map((monthNumber) => {
      const tmpMonth: GroupedBy<PreparedStatistics> = tmpYear[monthNumber] as GroupedBy<PreparedStatistics>
      const dayReleases: Array<DayReleases> = Object.keys(tmpYear[monthNumber]).map((day) => {
        return {
          day,
          releases: forceArray(tmpMonth[day])
        }
      })

      const a: MonthReleases = {
        month: monthNumber,
        monthName: moment().set({
          year: year,
          month: monthNumber,
          date: 2
        }).format('MMM'),
        releases: dayReleases
      }
      return a
    })

    return {
      year,
      releases: monthReleases
    }
  })
}

interface DayReleases {
  day: string;
  releases: Array<PreparedStatistics>;
}

interface MonthReleases {
  month: string;
  monthName: string;
  releases: Array<DayReleases>;
}

interface YearReleases {
  year: string;
  releases: Array<MonthReleases>;
}


function prepareRelease(release: StatisticInListing, locale: string): PreparedStatistics {
  const preparedVariant: PreparedVariant = Array.isArray(release.variants) ?
    concatReleaseTimes(release.variants, locale) :
    formatVariant(release.variants)
  return {
    id: release.id,
    name: locale === 'en' ? release.nameEN : release.name,
    shortName: release.shortName,
    variant: preparedVariant
  }
}

function concatReleaseTimes(variants: Array<VariantInListing>, locale: string): PreparedVariant {
  const defaultVariant: PreparedVariant = formatVariant(variants[0])
  const timePeriodes: Array<string> = variants.map((variant: VariantInListing) => calculatePeriode(variant))
  const formatedTimePeriodes: string = timePeriodes.join(` ${localize({
    key: 'and',
    locale
  })} `)
  return {
    ...defaultVariant,
    period: formatedTimePeriodes
  }
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
    const releasesOnThisDay: Array<StatisticInListing> = stats.reduce((acc: Array<StatisticInListing>, stat: StatisticInListing) => {
      const thisDayReleasedVariants: Array<VariantInListing> | undefined = Array.isArray(stat.variants) ?
        stat.variants.filter((variant: VariantInListing) => {
          return checkReleaseDate(variant, day)
        }) :
        checkReleaseDate(stat.variants, day) ? [stat.variants] : undefined
      if (thisDayReleasedVariants && thisDayReleasedVariants.length > 0) {
        acc.push({
          ...stat,
          variants: thisDayReleasedVariants
        })
      }
      return acc
    }, [])
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
      locale: currentLanguage,
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    // spesialtilfelle hvis periode-fra og periode-til er i samme år
    return localize({
      key: 'period.generic',
      locale: currentLanguage,
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
      locale: currentLanguage,
      values: [`${yearFrom.toString()}/${yearTo.toString()}`]
    })
  } else if (yearFrom !== yearTo ) {
    // spesialtilfelle hvis periode-fra og periode-til er i ulike år
    return localize({
      key: 'period.generic',
      locale: currentLanguage,
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    return localize({
      key: 'period.generic',
      locale: currentLanguage,
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
    locale: currentLanguage,
    values: [halfyear.toString(), date.getFullYear().toString()]
  })
}

function calculateTerm(variant: VariantInListing): string {
  const date: Date = new Date(variant.previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const termin: number = Math.ceil(fromMonth / 6)
  return localize({
    key: 'period.termin',
    locale: currentLanguage,
    values: [termin.toString(), date.getFullYear().toString()]
  })
}

function calculateQuarter(variant: VariantInListing) {
  const date: Date = new Date(variant.previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const quarter: number = Math.ceil(fromMonth / 3)
  return localize({
    key: 'period.quarter',
    locale: currentLanguage,
    values: [quarter.toString(), date.getFullYear().toString()]
  })
}

function calculateMonth(variant: VariantInListing) {
  const monthName: string = moment(variant.previousFrom).format('MMMM')
  const year: string = moment(variant.previousFrom).format('YYYY')
  return localize({
    key: 'period.month',
    locale: currentLanguage,
    values: [monthName, year]
  })
}

function calculateWeek(variant: VariantInListing) {
  const date: Date = new Date(variant.previousFrom)
  return localize({
    key: 'period.week',
    locale: currentLanguage,
    values: [getWeek(date).toString(), date.getFullYear().toString()]
  })
}

/*
*  Interfaces
*/
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


