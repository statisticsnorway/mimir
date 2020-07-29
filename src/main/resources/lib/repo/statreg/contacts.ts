import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchContacts as fetchContactsSvc } from '../../ssb/statreg'

export const STATREG_REPO_CONTACTS_KEY: string = 'contacts'

export function fetchContacts() {
  return fetchContactsSvc({})
}

export function getContactsFromRepo() {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_CONTACTS_KEY)
  return node ? node.content : null
}
