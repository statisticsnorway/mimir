import { StatRegNode } from '/lib/ssb/repo/statreg'
import { Contact, Kontakt, KontaktNavn, KontaktNavnType, KontaktXML } from '/lib/ssb/dashboard/statreg/types'
import { XmlParser } from '/lib/types/xmlParser'
import { HttpResponse } from '/lib/http-client'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

const { find } = __non_webpack_require__('/lib/vendor/ramda')
const { fetchStatRegData } = __non_webpack_require__('/lib/ssb/dashboard/statreg/common')
const { CONTACTS_URL, STATREG_BRANCH, STATREG_REPO, getStatRegBaseUrl } = __non_webpack_require__(
  '/lib/ssb/dashboard/statreg/config'
)
const { getNode } = __non_webpack_require__('/lib/ssb/repo/common')
const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')

export const STATREG_REPO_CONTACTS_KEY = 'contacts'

export function getContactsFromRepo(): Array<Contact> {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${STATREG_REPO_CONTACTS_KEY}`) as StatRegNode[]
  const contactsNode: StatRegNode | null = Array.isArray(node) ? node[0] : node
  const { data } = contactsNode
  return contactsNode ? (data as Array<Contact>) : []
}

function extractContacts(payload: string): Array<Contact> {
  const kontaktXML: KontaktXML = JSON.parse(xmlParser.parse(payload))
  const kontakter: Array<Kontakt> = kontaktXML.kontakter.kontakt
  return kontakter.map((k) => transformContact(k))
}

function transformContact(kontakt: Kontakt): Contact {
  const { id, telefon: telephone, mobil: mobile, epost: email, navn } = kontakt

  const navnNo: KontaktNavnType = Array.isArray(navn) ? find((n: KontaktNavn) => n['xml:lang'] === 'no')(navn) : ''

  return {
    id,
    telephone,
    mobile,
    email,
    name: navnNo && navnNo.content,
  } as Contact
}

export function fetchContacts(): Array<Contact> | null {
  try {
    const response: HttpResponse = fetchStatRegData('Contacts', getStatRegBaseUrl() + CONTACTS_URL)
    if (response.status === 200 && response.body) {
      return extractContacts(response.body)
    }
  } catch (error) {
    const message = `Failed to fetch data from statreg: Contacts (${error})`
    logUserDataQuery('Contacts', {
      file: '/lib/ssb/statreg/contacts.ts',
      function: 'fetchContacts',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: error,
    })
  }
  return null
}

export interface StatRegContactsLib {
  STATREG_REPO_CONTACTS_KEY: string
  fetchContacts: () => Array<Contact> | null
  getContactsFromRepo: () => Array<Contact> | null
}
