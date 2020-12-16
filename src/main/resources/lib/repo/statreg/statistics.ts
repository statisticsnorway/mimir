__non_webpack_require__('/lib/polyfills/nashorn')
import { StatRegNode, OldStatRegContent } from '../statreg'
import { StatisticInListing } from '../../ssb/statreg/types'
import { ArrayUtilsLib } from '../../ssb/arrayUtils'
import { StatRegConfigLib } from '../../ssb/statreg/config'
import { StatRegCommonLib } from '../../ssb/statreg/common'
import { RepoCommonLib } from '../common'
import { RepoQueryLib } from '../query'
import { HttpResponse } from 'enonic-types/http'

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
      return extractStatistics(response.body)
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
  getAllStatisticsFromRepo: () => Array<StatisticInListing>;
  getStatisticByIdFromRepo: (statId: string) => StatisticInListing | undefined;
  getStatisticByShortNameFromRepo: (shortName: string) => StatisticInListing | undefined;
}
