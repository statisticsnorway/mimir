__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { StatRegNode } from '/lib/ssb/repo/statreg'
import {
  StatisticInListing,
  VariantInListing,
  ReleasesInListing,
  ReleaseDatesVariant,
} from '/lib/ssb/dashboard/statreg/types'
import { HttpResponse } from '/lib/http-client'
import { format, isDateBetween, isSameDay, isAfter } from '/lib/ssb/utils/dateUtils'

const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { fetchStatRegData } = __non_webpack_require__('/lib/ssb/dashboard/statreg/common')
const { getStatRegBaseUrl, STATISTICS_URL, STATREG_BRANCH, STATREG_REPO } = __non_webpack_require__(
  '/lib/ssb/dashboard/statreg/config'
)
const { getNode } = __non_webpack_require__('/lib/ssb/repo/common')
const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')

export const STATREG_REPO_STATISTICS_KEY = 'statistics'

export function fetchStatistics(): Array<StatisticInListing> | null {
  try {
    const response: HttpResponse = fetchStatRegData('Statistics', getStatRegBaseUrl() + STATISTICS_URL)
    if (response.status === 200 && response.body) {
      const statistics: Array<StatisticInListing> = extractStatistics(response.body)
      if (app.config && app.config['ssb.mock.enable'] === 'true') {
        statistics.push(createMimirMockReleaseStatreg())
      }

      return statistics
    }
  } catch (error) {
    const message = `Failed to fetch data from statreg: Statistics (${error})`
    logUserDataQuery('Statistics', {
      file: '/lib/ssb/statreg/statistics.ts',
      function: 'fetchStatistics',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: error,
    })
  }
  return null
}

export function createMimirMockReleaseStatreg(): StatisticInListing {
  // use todays date for next release if its before 0800 in the morning
  const serverOffsetInMs: number = app.config?.['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  const midnight: number = new Date().setHours(0, 0, 0, 0)
  const eight: number = new Date().setHours(8, 0, 0, 0)
  const withServerOffset = new Date(new Date().getTime() + serverOffsetInMs).getTime()
  const isBeforeEight: boolean = withServerOffset >= midnight && withServerOffset <= eight
  const previousRelease = isBeforeEight ? new Date(eight).getTime() - 86400000 : eight
  const nextRelease = isBeforeEight ? eight : new Date(eight).getTime() + 86400000

  return {
    id: 0,
    shortName: 'mimir',
    name: 'Mimir',
    nameEN: 'Mimir',
    status: '',
    modifiedTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss.S'),
    variants: [
      {
        id: '0',
        frekvens: 'Dag',
        previousRelease: format(previousRelease, 'yyyy-MM-dd HH:mm:ss.S'),
        previousFrom: format(previousRelease, 'yyyy-MM-dd HH:mm:ss.S'),
        previousTo: format(previousRelease, 'yyyy-MM-dd HH:mm:ss.S'),
        nextRelease: format(nextRelease, 'yyyy-MM-dd HH:mm:ss.S'),
        nextReleaseId: '0',
        upcomingReleases: [
          {
            id: '0',
            publishTime: format(nextRelease, 'yyyy-MM-dd HH:mm:ss.S'),
            periodFrom: format(nextRelease, 'yyyy-MM-dd HH:mm:ss.S'),
            periodTo: format(nextRelease, 'yyyy-MM-dd HH:mm:ss.S'),
          },
        ],
      },
    ],
  }
}

export function fetchStatisticsWithRelease(before: Date): Array<StatisticInListing> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  return statistics.reduce((statsWithRelease: Array<StatisticInListing>, stat) => {
    const variants: Array<VariantInListing> = stat.variants
      ? ensureArray(stat.variants).sort((a: VariantInListing, b: VariantInListing) => {
          const aDate: Date = a.nextRelease ? new Date(a.nextRelease) : new Date('01.01.3000')
          const bDate: Date = b.nextRelease ? new Date(b.nextRelease) : new Date('01.01.3000')
          return aDate.getTime() - bDate.getTime()
        })
      : []
    if (variants[0] && isDateBetween(variants[0].nextRelease, new Date().toDateString(), before.toDateString())) {
      statsWithRelease.push(stat)
    }
    return statsWithRelease
  }, [])
}

export function fetchStatisticsWithReleaseToday(): Array<StatisticInListing> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  return statistics.reduce((statsWithRelease: Array<StatisticInListing>, stat) => {
    const variants: Array<VariantInListing> = ensureArray<VariantInListing>(stat.variants).filter(
      (variant) =>
        isSameDay(new Date(variant.nextRelease), new Date()) || isSameDay(new Date(variant.previousRelease), new Date())
    )
    if (variants.length > 0) {
      stat.variants = variants
      statsWithRelease.push(stat)
    }
    return statsWithRelease
  }, [])
}

//TODO: Remove possibly unused code
export function fetchStatisticsWithPreviousReleaseBetween(from: Date, to: Date): Array<StatisticInListing> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  return statistics.reduce((statsWithRelease: Array<StatisticInListing>, stat) => {
    const variants: Array<VariantInListing> = ensureArray<VariantInListing>(stat.variants).sort(
      (a: VariantInListing, b: VariantInListing) => {
        const aDate: Date = a.previousRelease ? new Date(a.previousRelease) : new Date('01.01.1970')
        const bDate: Date = b.previousRelease ? new Date(b.previousRelease) : new Date('01.01.1970')
        return bDate.getTime() - aDate.getTime()
      }
    )
    if (variants[0] && isDateBetween(variants[0].previousRelease, from.toDateString(), to.toDateString())) {
      stat.variants = variants
      statsWithRelease.push(stat)
    }
    return statsWithRelease
  }, [])
}

function extractStatistics(payload: string): Array<StatisticInListing> {
  return JSON.parse(payload).statistics
}

export function getAllStatisticsFromRepo(): Array<StatisticInListing> {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${STATREG_REPO_STATISTICS_KEY}`) as StatRegNode[]
  const statisticsNode: StatRegNode = Array.isArray(node) ? node[0] : node
  const { data } = statisticsNode
  return statisticsNode ? (data as Array<StatisticInListing>) : []
}

export function getStatisticByIdFromRepo(statId: string | undefined): StatisticInListing | undefined {
  if (!statId) {
    return undefined
  }
  // TODO: This is really inneficient when getStatisticByIdFromRepo is used in a map
  const allStats: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  return allStats.find((s) => statId === `${s.id}`)
}

export function getStatisticByShortNameFromRepo(shortName: string | undefined): StatisticInListing | undefined {
  if (!shortName) {
    return undefined
  }
  const allStats: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  return allStats.find((s) => shortName === s.shortName)
}

export function getReleaseDatesByVariants(variants: Array<VariantInListing>): ReleaseDatesVariant {
  const releaseDatesStatistic: ReleaseDatesVariant = {
    nextRelease: [],
    previousRelease: [],
  }
  const nextReleases: Array<string> = []
  const previousReleases: Array<string> = []
  variants.forEach((variant) => {
    const upcomingReleases: Array<ReleasesInListing> = variant.upcomingReleases
      ? ensureArray(variant.upcomingReleases)
      : []
    upcomingReleases.forEach((release) => nextReleases.push(release.publishTime))
    if (variant.previousRelease !== '') {
      previousReleases.push(variant.previousRelease)
    }
    // TODO:Remove next line when upcomingReleases exist in all enviroments
    if (upcomingReleases.length === 0 && variant.nextRelease !== '') nextReleases.push(variant.nextRelease)
  })

  const nextReleasesSorted: Array<string> = nextReleases.sort(
    (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
  )
  const serverOffsetInMs: number = app.config?.['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  const serverTime: Date = new Date(new Date().getTime() + serverOffsetInMs)
  const nextReleaseFiltered: Array<string> = nextReleasesSorted.filter((release) =>
    isAfter(new Date(release), serverTime)
  )
  const nextReleaseIndex: number = nextReleasesSorted.indexOf(nextReleaseFiltered[0])

  // If Statregdata is old, get date before nextRelease as previous date
  if (nextReleaseFiltered.length > 0 && nextReleaseIndex > 0) {
    previousReleases.push(nextReleasesSorted[nextReleaseIndex - 1])
  }
  if (nextReleasesSorted.length === 1 && nextReleaseFiltered.length === 0) {
    previousReleases.push(nextReleasesSorted[0])
  }
  previousReleases.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()).reverse()

  releaseDatesStatistic.nextRelease = nextReleaseFiltered
  releaseDatesStatistic.previousRelease = previousReleases

  return releaseDatesStatistic
}

export interface StatRegStatisticsLib {
  STATREG_REPO_STATISTICS_KEY: string
  fetchStatistics: () => Array<StatisticInListing> | null
  fetchStatisticsWithRelease: (before: Date) => Array<StatisticInListing>
  fetchStatisticsWithReleaseToday: () => Array<StatisticInListing>
  fetchStatisticsWithPreviousReleaseBetween: (from: Date, to: Date) => Array<StatisticInListing>
  getAllStatisticsFromRepo: () => Array<StatisticInListing>
  getStatisticByIdFromRepo: (statId: string | undefined) => StatisticInListing | undefined
  getStatisticByShortNameFromRepo: (shortName: string | undefined) => StatisticInListing | undefined
  getReleaseDatesByVariants: (variants: Array<VariantInListing>) => ReleaseDatesVariant
  createMimirMockReleaseStatreg: () => StatisticInListing
}
