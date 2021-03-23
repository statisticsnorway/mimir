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


const groupStatisticsByYear: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.year.toString()
})

const groupStatisticsByMonth: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.monthNumber.toString()
})

const groupStatisticsByDay: any = groupBy((statistic: PreparedStatistics): string => {
  return statistic.variant.day.toString()
})

exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

export function renderPart(req: Request): Response {
  const part: Component<NextStatisticReleasesPartConfig> = getComponent()
  const numberOfRelases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8
  // get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with next days.
  const releasesFiltered: Array<StatisticInListing> = filterOnNextRelease(releases, numberOfRelases)

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

function filterOnNextRelease(stats: Array<StatisticInListing>, numberOfReleases: number) {
  const nextReleases: Array<StatisticInListing> = []
  for (let i: number = 0; nextReleases.length < numberOfReleases; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() + i)
    const releasesOnThisDay: Array<StatisticInListing> = stats.filter((stat: StatisticInListing) => {
      return Array.isArray(stat.variants) ?
        stat.variants.find((variant: VariantInListing) => checkReleaseDate(variant, day)) :
        checkReleaseDate(stat.variants, day)
    })
    const trimmed: Array<StatisticInListing> = checkLimitAndTrim(nextReleases, releasesOnThisDay, numberOfReleases)
    nextReleases.push(...trimmed)
  }
  return nextReleases
}

function checkLimitAndTrim(nextReleases: Array<StatisticInListing>, releasesOnThisDay: Array<StatisticInListing>, count: number): Array<StatisticInListing> {
  if (nextReleases.length + releasesOnThisDay.length > count) {
    const whereToSlice: number = (count - nextReleases.length)
    return releasesOnThisDay.slice(0, whereToSlice)
  }
  return releasesOnThisDay
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

