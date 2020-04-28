import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { CONTACT_REG_SERVER } from '../server-config'

const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

const STAT_REG: string = `${CONTACT_REG_SERVER}/statistikkregisteret`
const CONTACTS_URL: string = `${STAT_REG}/kontakt/listSomXml`
const CONTACT_NAMES_URL: string = `${STAT_REG}/kontakt/hentNavn`

type QueryFilters = {
    [key: string]: string;
} | undefined;

function filtersToQuery (filters: QueryFilters): string {
  return filters ? Object.keys(filters)
    .map((key) => `${key}=${filters[key]}`)
    .join('&') :
    ''
}

export function fetchContactNames (filters: QueryFilters): Array<string> {
  // fetch from kontakt reg
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

  log.info(`result ~~~> ${JSON.stringify(result)}`)

  if ((result.status === 200) && result.body) {
    return JSON.parse(result.body).kontakt
  }

  log.error(`HTTP ${CONTACT_NAMES_URL} (${result.status} ${result.message}`)
  return ['oi']
}

/*
export const fetchContacts = (filters: QueryFilters) => {
    log.info('%%%%% fetching contacts ...');
    // fetch from kontakt reg
    const result: HttpResponse = http.request({
        url: `${CONTACTS_URL}?${filtersToQuery(filters)}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'text/xml',
        },
        connectionTimeout: 20000,
        readTimeout: 5000,
    });

    log.info(`result ~~~> ${result.body}`);

    if ((result.status === 200) && result.body) {
        const contacts = toJson(JSON.parse(result.body));
        log.info(`contacts ${contacts}`);
        return contacts;
    }

    log.error(`HTTP ${CONTACT_NAMES_URL} (${result.status} ${result.message}`);
    return ['oi'];
}; */
