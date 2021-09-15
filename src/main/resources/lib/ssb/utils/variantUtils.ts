import { Content } from 'enonic-types/content'
import { SEO } from '../../../services/news/news'
import { OmStatistikken } from '../../../site/content-types/omStatistikken/omStatistikken'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { ReleasesInListing, StatisticInListing, VariantInListing } from '../dashboard/statreg/types'

const {
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  query,
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getMainSubject
} = __non_webpack_require__( '/lib/ssb/utils/parentUtils')
const {
  sameDay
} = __non_webpack_require__('/lib/ssb/utils/dateUtils')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  groupBy
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

export function calculatePeriod(variant: VariantInListing, language: string, nextReleasePassed: boolean = false): string {
  let previousFrom: string = variant.previousFrom
  let previousTo: string = variant.previousTo
  if (nextReleasePassed) {
    const upcomingRelease: ReleasesInListing | undefined = variant.upcomingReleases ? forceArray(variant.upcomingReleases).find((r) => {
      return r && r.id === variant.nextReleaseId
    }) : undefined

    if (upcomingRelease) {
      previousFrom = upcomingRelease.periodFrom
      previousTo = upcomingRelease.periodTo
    }
  }

  switch (variant.frekvens) {
  case 'År':
    return calculateYear(previousFrom, previousTo, language)
  case 'Halvår':
    return calcualteHalfYear(previousFrom, language)
  case 'Termin':
    return calculateTerm(previousFrom, language)
  case 'Kvartal':
    return calculateQuarter(previousFrom, language)
  case 'Måned':
    return calculateMonth(previousFrom, language)
  case 'Uke':
    return calculateWeek(previousFrom, language)
  default:
    return calculateEveryXYear(previousFrom, previousTo, language)
  }
}

function calculateEveryXYear(previousFrom: string, previousTo: string, language: string): string {
  const dateFrom: Date = new Date(previousFrom)
  const dateTo: Date = new Date(previousTo)
  const yearFrom: number = dateFrom.getFullYear()
  const yearTo: number = dateTo.getFullYear()

  if (yearFrom !== yearTo) {
    return localize({
      key: 'period.generic',
      locale: language,
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    // spesialtilfelle hvis periode-fra og periode-til er i samme år
    return localize({
      key: 'period.generic',
      locale: language,
      values: [yearTo.toString()]
    })
  }
}

function calculateYear(previousFrom: string, previousTo: string, language: string): string {
  const dateFrom: Date = new Date(previousFrom)
  const dateTo: Date = new Date(previousTo)
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
      locale: language,
      values: [`${yearFrom.toString()}/${yearTo.toString()}`]
    })
  } else if (yearFrom !== yearTo ) {
    // spesialtilfelle hvis periode-fra og periode-til er i ulike år
    return localize({
      key: 'period.generic',
      locale: language,
      values: [`${yearFrom.toString()}-${yearTo.toString()}`]
    })
  } else {
    return localize({
      key: 'period.generic',
      locale: language,
      values: [yearTo.toString()]
    })
  }
}

function calcualteHalfYear(previousFrom: string, language: string): string {
  const date: Date = new Date(previousFrom)
  const fromMonth: number = new Date(previousFrom).getMonth() + 1
  const halfyear: number = Math.ceil(fromMonth / 6)
  return localize({
    key: 'period.halfyear',
    locale: language,
    values: [halfyear.toString(), date.getFullYear().toString()]
  })
}

function calculateTerm(previousFrom: string, language: string): string {
  const date: Date = new Date(previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const termin: number = Math.ceil(fromMonth / 6)
  return localize({
    key: 'period.termin',
    locale: language,
    values: [termin.toString(), date.getFullYear().toString()]
  })
}

function calculateQuarter(previousFrom: string, language: string): string {
  const date: Date = new Date(previousFrom)
  const fromMonth: number = date.getMonth() + 1
  const quarter: number = Math.ceil(fromMonth / 3)
  return localize({
    key: 'period.quarter',
    locale: language,
    values: [quarter.toString(), date.getFullYear().toString()]
  })
}

function calculateMonth(previousFrom: string, language: string): string {
  const monthName: string = moment(previousFrom).locale(language).format('MMMM')
  const year: string = moment(previousFrom).locale(language).format('YYYY')
  return localize({
    key: 'period.month',
    locale: language,
    values: [monthName, year]
  })
}

function getWeek(date: Date): number {
  const onejan: number = new Date(date.getFullYear(), 0, 1).getTime()
  const today: number = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diff: number = today - onejan
  const dayOfYear: number = ((diff + 86400000) / 86400000)
  return Math.ceil(dayOfYear / 7)
}

function calculateWeek(previousFrom: string, language: string): string {
  const date: Date = new Date(previousFrom)
  return localize({
    key: 'period.week',
    locale: language,
    values: [getWeek(date).toString(), date.getFullYear().toString()]
  })
}

export function addMonthNames(groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>>, language: string): Array<YearReleases> {
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
        monthName: moment().locale(language).set({
          year: parseInt(year),
          month: parseInt(monthNumber),
          date: 2
        })
          .format('MMM'),
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


export const groupStatisticsByYear: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy(
  (statistic: PreparedStatistics): string => {
    return statistic.variant.year.toString()
  }
)

export const groupStatisticsByMonth: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy(
  (statistic: PreparedStatistics): string => {
    return statistic.variant.monthNumber.toString()
  }
)

export const groupStatisticsByDay: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics> = groupBy(
  (statistic: PreparedStatistics): string => {
    return statistic.variant.day.toString()
  }
)

// group by year, then month, then day
export function groupStatisticsByYearMonthAndDay(releasesPrepped: Array<PreparedStatistics>):
    GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> {
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

  return groupedByYearMonthAndDay
}


export function getReleasesForDay(
  statisticList: Array<StatisticInListing>,
  day: Date,
  property: keyof VariantInListing = 'previousRelease'
): Array<StatisticInListing> {
  return statisticList.reduce((acc: Array<StatisticInListing>, stat: StatisticInListing) => {
    const thisDayReleasedVariants: Array<VariantInListing> | undefined = Array.isArray(stat.variants) ?
      stat.variants.filter((variant: VariantInListing) => {
        return checkVariantReleaseDate(variant, day, property)
      }) : stat.variants && checkVariantReleaseDate(stat.variants, day, property) ? [stat.variants] : undefined
    if (thisDayReleasedVariants && thisDayReleasedVariants.length > 0) {
      acc.push({
        ...stat,
        variants: thisDayReleasedVariants
      })
    }
    return acc
  }, [])
}

export function filterOnComingReleases(stats: Array<StatisticInListing>, count: number, startDay?: string): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  const day: Date = startDay ? new Date(startDay) : new Date()
  for (let i: number = 0; i < count && i < 20; i++) {
    day.setDate(day.getDate() + 1)
    const releasesOnThisDay: Array<StatisticInListing> = getReleasesForDay(stats, day, 'nextRelease')
    if (releasesOnThisDay.length === 0) count++ // if no hits found on this day. add one day
    releases.push(...releasesOnThisDay)
  }
  return releases
}

export function checkVariantReleaseDate(variant: VariantInListing, day: Date, property: keyof VariantInListing): boolean {
  const dayFromVariant: string = variant[property] as string
  if (property === 'previousRelease') {
    return sameDay(new Date(dayFromVariant), day) || nextReleasedPassed(variant)
  } else {
    return sameDay(new Date(dayFromVariant), day)
  }
}

export function prepareRelease(
  release: StatisticInListing,
  language: string,
  property: keyof VariantInListing = 'previousRelease'): PreparedStatistics | null {
  if (release.variants) {
    const preparedVariant: PreparedVariant = Array.isArray(release.variants) ?
      concatReleaseTimes(release.variants, language, property) :
      formatVariant(release.variants, language, property)

    const statisticsPagesXP: Content<Statistics, object, SEO> | undefined = query({
      count: 1,
      query: `data.statistic LIKE "${release.id}" AND language IN (${language === 'nb' ? '"nb", "nn"' : '"en"'})`,
      contentTypes: [`${app.name}:statistics`]
    }).hits[0] as unknown as Content<Statistics, object, SEO>
    const statisticsPageUrl: string | undefined = statisticsPagesXP ? pageUrl({
      path: statisticsPagesXP._path
    }) : undefined
    const aboutTheStatisticsContent: Content<OmStatistikken> | null = statisticsPagesXP && statisticsPagesXP.data.aboutTheStatistics ? get({
      key: statisticsPagesXP.data.aboutTheStatistics
    }) : null
    const seoDescription: string | undefined = statisticsPagesXP ? statisticsPagesXP.x['com-enonic-app-metafields']['meta-data'].seoDescription : ''

    return {
      id: release.id,
      name: language === 'en' ? release.nameEN : release.name,
      shortName: release.shortName,
      type: localize({
        key: 'statistic',
        locale: language
      }),
      mainSubject: getMainSubject(release.shortName, language),
      variant: preparedVariant,
      statisticsPageUrl,
      aboutTheStatisticsDescription: aboutTheStatisticsContent ? aboutTheStatisticsContent.data.ingress : seoDescription
    }
  }
  return null
}

function concatReleaseTimes(variants: Array<VariantInListing>, language: string, property: keyof VariantInListing): PreparedVariant {
  const defaultVariant: PreparedVariant = formatVariant(variants[0], language, property)
  let timePeriodes: Array<string>

  if (property === 'previousRelease') {
    timePeriodes = variants.map((variant: VariantInListing) => calculatePeriod(variant, language, nextReleasedPassed(variant)))
  } else {
    timePeriodes = variants.map((variant: VariantInListing) => calculatePeriod(variant, language))
  }

  const formatedTimePeriodes: string = timePeriodes.join(` ${localize({
    key: 'and',
    locale: language
  })} `)
  return {
    ...defaultVariant,
    period: formatedTimePeriodes
  }
}

// If import from statreg failed use nextRelease instead of previousRelease
function nextReleasedPassed(variant: VariantInListing): boolean {
  const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  const serverTime: Date = new Date(new Date().getTime() + serverOffsetInMs)
  const nextRelease: Date = new Date(variant.nextRelease)
  return moment(nextRelease).isBefore(serverTime, 'minute')
}

function formatVariant(variant: VariantInListing, language: string, property: keyof VariantInListing): PreparedVariant {
  const variantProperty: string = variant[property] as string
  let date: Date = new Date(variantProperty)
  let nextReleaseDatePassed: boolean = false

  if (property === 'previousRelease') {
    nextReleaseDatePassed = nextReleasedPassed(variant)
    date = nextReleaseDatePassed ? new Date(variant.nextRelease) : new Date(variantProperty)
  }

  return {
    id: variant.id,
    day: date.getDate(),
    monthNumber: date.getMonth(),
    year: date.getFullYear(),
    frequency: variant.frekvens,
    period: calculatePeriod(variant, language, nextReleaseDatePassed)
  }
}

export interface VariantUtilsLib {
  calculatePeriod: (variant: VariantInListing, language: string) => string;
  addMonthNames: (groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>>, language: string) => Array<YearReleases>;
  groupStatisticsByYear: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics>;
  groupStatisticsByMonth: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics>;
  groupStatisticsByDay: (statistics: Array<PreparedStatistics>) => GroupedBy<PreparedStatistics>;
  groupStatisticsByYearMonthAndDay: (releasesPrepped: Array<PreparedStatistics>) => GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>>;
  getReleasesForDay: (statisticList: Array<StatisticInListing>, day: Date, property?: keyof VariantInListing) => Array<StatisticInListing>;
  prepareRelease: (release: StatisticInListing, locale: string, property?: keyof VariantInListing, statisticsPageUrl?: string) => PreparedStatistics;
  filterOnComingReleases: (stats: Array<StatisticInListing>, daysInTheFuture: number, startDay?: string) => Array<StatisticInListing>;
}

export interface PreparedStatistics {
  id: number;
  name: string;
  shortName: string;
  variant: PreparedVariant;
  type?: string;
  date?: string;
  mainSubject?: string;
  statisticsPageUrl?: string;
  aboutTheStatisticsDescription?: string;
}

export interface PreparedVariant {
  id: string;
  day: number;
  monthNumber: number;
  year: number;
  frequency: string;
  period: string;
}

export interface DayReleases {
  day: string;
  releases: Array<PreparedStatistics>;
}

export interface MonthReleases {
  month: string;
  monthName: string;
  releases: Array<DayReleases>;
}

export interface YearReleases {
  year: string;
  releases: Array<MonthReleases>;
}

export interface GroupedBy<T> {
  [key: string]: Array<T> | T;
}

