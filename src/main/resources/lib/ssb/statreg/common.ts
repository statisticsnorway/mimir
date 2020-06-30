import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { XmlParser } from '../../types/xmlParser'
import { QueryFilters } from '../../repo/common'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

export function filtersToQuery(filters: QueryFilters): string {
  return filters ? Object.keys(filters)
    .map((key) => `${key}=${filters[key]}`)
    .join('&') :
    ''
}

export function fetchStatRegData<T, XmlType>(
  dataKey: string,
  serviceUrl: string,
  filters: QueryFilters,
  extractor: (xml: XmlType) => Array<T>): Array<T> {
  const result: HttpResponse = http.request({
    url: `${serviceUrl}/${filtersToQuery(filters)}`,
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
    const data: Array<T> = extractor(__.toNativeObject(xmlParser.parse(result.body)))
    log.info(`Fetched ${data ? data.length : 0} ${dataKey}`)
    return data
  }

  log.error(`HTTP ${serviceUrl} (${result.status} ${result.message}`)
  throw new Error(`Could not fetch ${dataKey} from StatReg: ${result.status} ${result.message}`)
}
