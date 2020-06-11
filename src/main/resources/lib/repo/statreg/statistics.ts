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
  return (getAllStatisticsFromRepo() || [])
    .find((stat) => `${stat.id}` === statId)
}

export function getStatisticByShortNameFromRepo(shortName: string): Statistic | undefined {
  return ensureArray(getAllStatisticsFromRepo())
    .find((stat: Statistic) => stat.shortName === shortName)
}
