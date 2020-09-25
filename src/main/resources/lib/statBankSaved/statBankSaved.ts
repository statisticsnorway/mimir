import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/lib/http'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
import { XmlParser } from '../types/xmlParser'

const {
  sleep
} = __non_webpack_require__('/lib/xp/task')
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

export function get(url: string): object | null {
  const requestParams: HttpRequestParams = {
    url,
    method: 'POST',
    contentType: 'text/html',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'text/html'
    },
    connectionTimeout: 20000,
    readTimeout: 5000
  }

  const result: HttpResponse = http.request(requestParams)
  if (result.status !== 200) {
    log.error(`HTTP ${url} (${result.status} ${result.message})`)
  }

  if (result.status === 429) { // 429 = too many requests
    sleep(30 * 1000)
  }

  if (result.status === 200 && result.body) {
    return {
      html: result.body,
      json: xmlParser.parse(result.body)
    }
  }
  return null
}
