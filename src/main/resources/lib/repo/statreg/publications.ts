import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchPublications as fetchPublicationsSvc } from '../../ssb/statreg'

export const STATREG_REPO_PUBLICATIONS_KEY: string = 'publications'

export function fetchPublications() {
  return fetchPublicationsSvc({})
}

export function getPublicationsFromRepo() {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_PUBLICATIONS_KEY)
  return node ? node.content : null
}
