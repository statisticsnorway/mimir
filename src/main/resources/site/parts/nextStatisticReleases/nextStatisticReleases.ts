import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/statreg/types'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { groupBy } from 'ramda'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../../lib/repo/statreg/statistics')


const groupStatisticsByYear: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.year.toString()
})

const groupStatisticsByMonth: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.monthNumber.toString()
})

const groupStatisticsByDay: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.day.toString()
})


export function get(req: Request): Response {
  // get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with next days.
  const releasesFiltered: Array<StatisticInListing> = filterOnNextRelease(releases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release))

  // group by year, then  month, then day
  const groupedByYear: GroupedBy = groupStatisticsByYear(releasesPrepped)
  const groupedByMonth: GroupedBy = {}
  const groupedByDay: GroupedBy = {}
  Object.keys(groupedByYear).forEach((year) => {
    const tmpMonth: GroupedBy = groupStatisticsByMonth(groupedByYear[year])
    Object.keys(tmpMonth).forEach((month) => {
      groupedByDay[month] = groupStatisticsByDay(tmpMonth[month])
    })
    groupedByMonth[year] = groupedByDay
  })

  // render component
  const reactComponent: React4xpObject = new React4xp('NextStatisticReleases')
    .setProps({
      releases: groupedByMonth
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

function prepareRelease(release: StatisticInListing) {
  const preparedVariant: PreparedVariant = Array.isArray(release.variants) ? closestReleaseDate(release.variants) : formatVariant(release.variants)
  return {
    id: release.id,
    name: release.name,
    variant: preparedVariant
  }
}

function closestReleaseDate(variants: Array<VariantInListing>): PreparedVariant {
  const variantWithClosestNextRelease: VariantInListing = variants.reduce((earliestVariant, variant) => {
    const newDate: Date = new Date(variant.nextRelease)
    if (!variant || newDate < new Date(earliestVariant.nextRelease) ) return variant
    return earliestVariant
  })

  return formatVariant(variantWithClosestNextRelease)
}

function formatVariant(variant: VariantInListing): PreparedVariant {
  const date: Date = new Date(variant.nextRelease)
  return {
    id: variant.id,
    day: date.getDay(),
    monthNumber: date.getMonth(),
    year: date.getFullYear(),
    frequency: variant.frekvens
  }
}

function filterOnNextRelease(stats: Array<StatisticInListing>) {
  const nextReleases: Array<StatisticInListing> = []
  for (let i: number = 0; nextReleases.length < 8; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() + i)
    const releasesOnThisDay: Array<StatisticInListing> = stats.filter((stat: StatisticInListing) => {
      return Array.isArray(stat.variants) ?
        stat.variants.find((variant: VariantInListing) => checkReleaseDate(variant, day)) :
        checkReleaseDate(stat.variants, day)
    })
    nextReleases.push(...releasesOnThisDay)
  }
  return nextReleases
}

function checkReleaseDate(variant: VariantInListing, day: Date) {
  return sameDay(new Date(variant.nextRelease), day)
}

function sameDay(d1: Date, d2: Date) {
  return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
}

interface PreparedStatistics {
  id: number;
  name: string;
  variant: PreparedVariant;
}

interface PreparedVariant {
  id: string;
  day: number;
  monthNumber: number;
  year: number;
  frequency: string;

}

interface GroupedBy {
  [key: string]: Array<object> | object;
}

