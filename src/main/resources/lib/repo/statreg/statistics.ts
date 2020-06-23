import { find } from 'ramda'
import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchStatistics as fetchStatisticsSvc } from '../../ssb/statreg'
import { Statistic } from '../../ssb/statreg/types'
import { ensureArray } from '../../ssb/arrayUtils'

export const STATREG_REPO_STATISTICS_KEY: string = 'statistics'

export function fetchStatistics() {
  return fetchStatisticsSvc({})
}

export function getAllStatisticsFromRepo(): Array<Statistic> | null {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_STATISTICS_KEY)
  return node ? (node.content as Array<Statistic>) : null
}

export function getStatisticByIdFromRepo(statId: string): Statistic | undefined {
  if (!statId) {
    return undefined
  }
  const allStats: Array<Statistic> = ensureArray(getAllStatisticsFromRepo())
  return find((stat: Statistic) => `${stat.id}` === statId)(allStats)
}

export function getStatisticByShortNameFromRepo(shortName: string): Statistic | undefined {
  if (!shortName) {
    return undefined
  }
  const allStats: Array<Statistic> = ensureArray(getAllStatisticsFromRepo())
  return find((stat: Statistic) => stat.shortName === shortName)(allStats)
}
