import { StatRegFetchResult, StatRegNode } from '../statreg'
import { Contact, Kontakt, KontaktNavn, KontaktNavnType, KontaktXML } from '../../ssb/statreg/types'
import { XmlParser } from '../../types/xmlParser'
import { find } from 'ramda'
import { StatRegCommonLib } from '../../ssb/statreg/common'
import { StatRegConfigLib } from '../../ssb/statreg/config'
import { RepoCommonLib } from '../common'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

const {
  fetchStatRegData
}: StatRegCommonLib = __non_webpack_require__('/lib/ssb/statreg/common')
const {
  CONTACTS_URL,
  STATREG_BRANCH,
  STATREG_REPO,
  getStatRegBaseUrl
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export const STATREG_REPO_CONTACTS_KEY: string = 'contacts'

export function getContactsFromRepo(): Array<Contact> {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${STATREG_REPO_CONTACTS_KEY}`) as StatRegNode[]
  const contactsNode: StatRegNode | null = Array.isArray(node) ? node[0] : node
  return contactsNode ? contactsNode.data as Array<Contact> : []
}

function extractContacts(payload: string): Array<Contact> {
  const kontaktXML: KontaktXML = JSON.parse(xmlParser.parse(payload))
  const kontakter: Array<Kontakt> = kontaktXML.kontakter.kontakt
  return kontakter.map((k) => transformContact(k))
}

function transformContact(kontakt: Kontakt): Contact {
  const {
    id, telefon: telephone, mobil: mobile, epost: email, navn
  } = kontakt

  const navnNo: KontaktNavnType =
        Array.isArray(navn) ?
          find((n: KontaktNavn) => n['xml:lang'] === 'no')(navn) :
          ''

  return {
    id,
    telephone,
    mobile,
    email,
    name: navnNo && navnNo.content
  } as Contact
}

export function fetchContacts(): StatRegFetchResult {
  return fetchStatRegData('Contacts', getStatRegBaseUrl() + CONTACTS_URL, extractContacts)
}

export interface StatRegContactsLib {
  STATREG_REPO_CONTACTS_KEY: string;
  fetchContacts: () => StatRegFetchResult;
  getContactsFromRepo: () => Array<Contact> | null;
}
