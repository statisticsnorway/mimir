import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { TbmlData, TbmlSourceList, XmlParser } from '../types/xmlParser'
import { RepoQueryLib } from '../repo/query'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')


export function getTbmlData<T extends TbmlData | TbmlSourceList>(url: string, queryId?: string, processXml?: string): TbprocessorParsedResponse<T> {
  const response: HttpResponse = fetch(url, queryId, processXml)
  return {
    body: response.body,
    status: response.status,
    parsedBody: response.body && response.status === 200 ? xmlToJson(response.body, queryId): undefined
  }
}

function fetch(url: string, queryId?: string, processXml?: string): HttpResponse {
  const requestParams: HttpRequestParams = {
    url,
    body: processXml,
    method: processXml ? 'POST' : 'GET',
    readTimeout: 30000
  }
  const response: HttpResponse = http.request(requestParams)

  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/tbml/tbml.ts',
      function: 'fetch',
      message: Events.REQUEST_DATA,
      status: `${response.status}`,
      request: requestParams,
      response
    })
  }

  if (response.status !== 200 && response.body) {
    if (queryId) {
      logUserDataQuery(queryId, {
        file: '/lib/tbml/tbml.ts',
        function: 'fetch',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
        status: `${response.status}`,
        response
      })
    }
    const message: string = `Failed with status ${response.status} while fetching tbml data from ${url}`
    log.error(message)
  }

  return response
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
  getTbmlData: <T extends TbmlData | TbmlSourceList>(url: string, queryId?: string, processXml?: string) => TbprocessorParsedResponse<T>;
}

export interface TbprocessorParsedResponse<T extends TbmlData | TbmlSourceList> {
  body: string | null;
  status: number;
  parsedBody?: T;
}

export interface Authorization {
  Authorization: string;
}
