import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchStatistics as fetchStatisticsSvc } from '../../ssb/statreg'

export const STATREG_REPO_STATISTICS_KEY: string = 'statistics'

export function fetchStatistics() {
  return fetchStatisticsSvc({})
}

export function getContactsFromRepo() {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_STATISTICS_KEY)
  return node ? node.content : null
}
