import { getStatRegNode, StatRegNode } from '../statreg'
import { fetchContacts as fetchContactsSvc } from '../../ssb/statreg'
import { Contact } from '../../ssb/statreg/types'

export const STATREG_REPO_CONTACTS_KEY: string = 'contacts'

export function fetchContacts(): Array<Contact> {
  return fetchContactsSvc({})
}

export function getContactsFromRepo(): StatRegNode['content'] | null {
  const node: StatRegNode | null = getStatRegNode(STATREG_REPO_CONTACTS_KEY)
  return node ? node.content : null
}

export interface StatRegContactsLib {
  STATREG_REPO_CONTACTS_KEY: string;
  fetchContacts: () => Array<Contact>;
  getContactsFromRepo: () => StatRegNode['content'] | null;
}
