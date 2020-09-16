import { StatRegNode, StatRegRepoLib } from '../statreg'
import { SSBStatRegLib } from '../../ssb/statreg'
import { Publication } from '../../ssb/statreg/types'
import { ArrayUtilsLib } from '../../ssb/arrayUtils'

const {
  ensureArray
}: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/arrayUtils')
const {
  fetchPublications: fetchPublicationsSvc
}: SSBStatRegLib = __non_webpack_require__('/lib/ssb/statreg')
const {
  getStatRegNode
}: StatRegRepoLib = __non_webpack_require__('/lib/repo/statreg')

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
