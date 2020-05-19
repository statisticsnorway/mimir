import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { XmlParser } from '../../types/xmlParser'
import { QueryFilters } from '../../repo/common'
import { extractContacts, Contact } from './types'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

const STAT_REG_SVC_PROP: string = 'ssb.statreg.baseUrl'
const STAT_REG: string = `${app.config && app.config[STAT_REG_SVC_PROP]}`
const CONTACTS_URL: string = `${STAT_REG}/kontakt/listSomXml`
const CONTACT_NAMES_URL: string = `${STAT_REG}/kontakt/hentNavn`

function filtersToQuery(filters: QueryFilters): string {
  return filters ? Object.keys(filters)
    .map((key) => `${key}=${filters[key]}`)
    .join('&') :
    ''
}

export function fetchContactNames(filters: QueryFilters): Array<string> {
  const result: HttpResponse = http.request({
    url: `${CONTACT_NAMES_URL}?${filtersToQuery(filters)}`,
    method: 'GET',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000
  })

  if ((result.status === 200) && result.body) {
    return JSON.parse(result.body).kontakt
  }

  const errMsg: string = `Unexpected response from server: ${result.status}: ${JSON.stringify(result.message)}. Payload: ${JSON.stringify(result.body)}`
  log.error(errMsg)
  throw new Error(errMsg)
}

export function fetchContacts(filters: QueryFilters) {
  const result: HttpResponse = http.request({
    url: `${CONTACTS_URL}?${filtersToQuery(filters)}`,
    method: 'GET',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'text/xml'
    },
    connectionTimeout: 20000,
    readTimeout: 5000
  })

  if ((result.status === 200) && result.body) {
    const contacts: Array<Contact> = extractContacts(__.toNativeObject(xmlParser.parse(result.body)))
    log.info(`Fetched ${contacts ? contacts.length : 0} contacts`)
    return contacts
  }

  log.error(`HTTP ${CONTACT_NAMES_URL} (${result.status} ${result.message}`)
  throw new Error(`Could not fetch Contacts from StatReg: ${result.status} ${result.message}`)
}
