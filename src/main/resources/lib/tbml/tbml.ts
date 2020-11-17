import { HttpLibrary, HttpResponse } from 'enonic-types/http'
import { TbmlData, TbmlSourceList, XmlParser } from '../types/xmlParser'
import { RepoQueryLib } from '../repo/query'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

export function fetch(url: string, queryId?: string): string | null{
  let result: string | null = null

  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/tbml/tbml.ts',
      function: 'fetch',
      message: Events.REQUEST_DATA,
      request: {
        url
      }
    })
  }

  const response: HttpResponse = http.request({
    url
  })

  const {
    body,
    status
  } = response

  if (status === 200 && body) {
    result = body
  } else {
    if (queryId) {
      logUserDataQuery(queryId, {
        file: '/lib/tbml/tbml.ts',
        function: 'fetch',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
        status: `${status}`,
        response
      })
    }
    log.error(`Failed with status ${status} while fetching tbml data from ${url}`)
  }

  return result
}

export function getTbmlData(url: string, queryId?: string): TbmlData | null {
  const result: string | null = fetch(url, queryId)
  if (result) {
    return xmlToJson(result, queryId)
  }
  return null
}

export function getTbmlSourceList(url: string): TbmlSourceList | null {
  const result: string | null = fetch(url)
  if (result) {
    const jsonResult: TbmlSourceList = xmlToJson(result)
    return jsonResult ? jsonResult : null
  }
  return null
}

function xmlToJson<T>(xml: string, queryId?: string): T {
  try {
    const json: string = xmlParser.parse(xml)
    return JSON.parse(json)
  } catch (e) {
    if (queryId) {
      logUserDataQuery(queryId, {
        function: 'xmlToJson',
        file: '/lib/tbml/tbml.ts',
        info: e,
        message: Events.XML_TO_JSON
      })
    }
    throw new Error( `Failed while parsing tbml data: ${e}`)
  }
}

export interface TbmlLib {
  fetch: (url: string, queryId?: string) => string | null;
  getTbmlData: (url: string, queryId?: string) => TbmlData | null;
  getTbmlSourceList: (tbmlId: string) => TbmlSourceList | null;
}
