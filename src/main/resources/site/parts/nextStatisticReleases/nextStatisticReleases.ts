import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/statreg/types'
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '../../../lib/repo/statreg/statistics')

export function get(req: Request): Response {
  // get statistics
  const b: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today.
  const bfiltered: Array<StatisticInListing> = filterOnNextRelease(b)
  log.info(JSON.stringify('bfiltered', null, 2))
  log.info(JSON.stringify(bfiltered, null, 2))

  // get config with number of statistics to show and title
  return {
    body: 'List coming'
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
