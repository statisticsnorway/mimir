__non_webpack_require__('/lib/polyfills/nashorn')
import { StatRegNode, OldStatRegContent } from '../statreg'
import { StatisticInListing, VariantInListing } from '../../ssb/statreg/types'
import { ArrayUtilsLib } from '../../ssb/arrayUtils'
import { StatRegConfigLib } from '../../ssb/statreg/config'
import { StatRegCommonLib } from '../../ssb/statreg/common'
import { RepoCommonLib } from '../common'
import { RepoQueryLib } from '../query'
import { HttpResponse } from 'enonic-types/http'
import moment = require('moment')

const {
  ensureArray
}: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/arrayUtils')
const {
  fetchStatRegData
}: StatRegCommonLib = __non_webpack_require__('/lib/ssb/statreg/common')
const {
  getStatRegBaseUrl,
  STATISTICS_URL,
  STATREG_BRANCH,
  STATREG_REPO
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  Events,
  logUserDataQuery
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

export const STATREG_REPO_STATISTICS_KEY: string = 'statistics'

export function fetchStatistics(): Array<StatisticInListing> | null {
  try {
    const response: HttpResponse = fetchStatRegData('Statistics', getStatRegBaseUrl() + STATISTICS_URL)
    if (response.status === 200 && response.body) {
      const statistics: Array<StatisticInListing> = extractStatistics(response.body)
      if (app.config && app.config['ssb.mock.enable'] === 'true') {
        // use todays date for next release if its before 0800 in the morning
        const serverOffsetInMs: number = app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
        const midnight: moment.Moment = moment()
          .hour(0)
          .minute(0)
        const eight: moment.Moment = moment()
          .hour(8)
          .minute(0)
        const isBeforeEight: boolean = moment()
          .add(serverOffsetInMs, 'milliseconds')
          .isBetween(midnight, eight, 'hour', '[)')

        const previousRelease: moment.Moment = moment()
          .subtract(isBeforeEight ? 1 : 0, 'days')
        const nextRelease: moment.Moment = moment()
          .hour(8)
          .minute(0)
          .add(isBeforeEight ? 0 : 1, 'days')

        statistics.push({
          id: 0,
          shortName: 'mimir',
          name: 'Mimir',
          nameEN: 'Mimir',
          status: '',
          modifiedTime: '2020-04-16 11:14:19.121',
          variants: [{
            id: '0',
            frekvens: 'Dag',
            previousRelease: previousRelease.toISOString(),
            nextRelease: nextRelease.toISOString(),
            nextReleaseId: '0'
          }]
        })
      }

      return statistics
    }
  } catch (error) {
    const message: string = `Failed to fetch data from statreg: Statistics (${error})`
    logUserDataQuery('Statistics', {
      file: '/lib/ssb/statreg/statistics.ts',
      function: 'fetchStatistics',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: error
    })
  }
  return null
}

export function fetchStatisticsWithRelease(before: Date): Array<StatisticInListing> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  return statistics.reduce((statsWithRelease: Array<StatisticInListing>, stat) => {
    const variants: Array<VariantInListing> = ensureArray(stat.variants)
    variants.sort((a: VariantInListing, b: VariantInListing) => new Date(a.nextRelease).getTime() - new Date(b.nextRelease).getTime())
    if (variants[0] && moment(variants[0].nextRelease).isBetween(new Date(), before, 'day', '[]')) {
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
  let {
    data
  } = statisticsNode
  if (!data && (statisticsNode as unknown as OldStatRegContent).content) {
    data = (statisticsNode as unknown as OldStatRegContent).content as Array<StatisticInListing>
  }
  return statisticsNode ? (data as Array<StatisticInListing>) : []
}

export function getStatisticByIdFromRepo(statId: string): StatisticInListing | undefined {
  if (!statId) {
    return undefined
  }
  const allStats: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  return allStats.find((s) => statId === `${s.id}`)
}

export function getStatisticByShortNameFromRepo(shortName: string): StatisticInListing | undefined {
  if (!shortName) {
    return undefined
  }
  const allStats: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  return allStats.find((s) => shortName === s.shortName)
}

export interface StatRegStatisticsLib {
  STATREG_REPO_STATISTICS_KEY: string;
  fetchStatistics: () => Array<StatisticInListing> | null;
  fetchStatisticsWithRelease: (before: Date) => Array<StatisticInListing>;
  getAllStatisticsFromRepo: () => Array<StatisticInListing>;
  getStatisticByIdFromRepo: (statId: string) => StatisticInListing | undefined;
  getStatisticByShortNameFromRepo: (shortName: string) => StatisticInListing | undefined;
}
