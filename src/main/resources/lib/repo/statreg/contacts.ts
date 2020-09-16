import { StatRegNode, StatRegRepoLib } from '../statreg'
import { SSBStatRegLib } from '../../ssb/statreg'
import { Contact } from '../../ssb/statreg/types'

const {
  getStatRegNode
}: StatRegRepoLib = __non_webpack_require__('/lib/repo/statreg')
const {
  fetchContacts: fetchContactsSvc
}: SSBStatRegLib = __non_webpack_require__('/lib/ssb/statreg')

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
