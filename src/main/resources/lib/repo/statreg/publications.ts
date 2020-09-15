import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchPublications as fetchPublicationsSvc } from '../../ssb/statreg'
import { Publication } from '../../ssb/statreg/types'
import { ensureArray } from '../../ssb/arrayUtils'

export const STATREG_REPO_PUBLICATIONS_KEY: string = 'publications'

export function fetchPublications(): Array<Publication> {
  return fetchPublicationsSvc({})
}

export function getAllPublicationsFromRepo(): Array<Publication> | null {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_PUBLICATIONS_KEY)
  return node ? (node.content as Array<Publication>) : null
}

export function getPublicationsForStatistic(shortName: string): Array<Publication> {
  return ensureArray(getAllPublicationsFromRepo())
    .filter((pub: Publication) => pub.statisticsKey === shortName)
}

export interface StatRegPublicationsLib {
  STATREG_REPO_PUBLICATIONS_KEY: string;
  fetchPublications: () => Array<Publication>;
  getAllPublicationsFromRepo: () => Array<Publication> | null;
  getPublicationsForStatistic: (shortName: string) => Array<Publication>;
}
