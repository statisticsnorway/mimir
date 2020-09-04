import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { TbmlData, XmlParser } from '../types/xmlParser'
import { RepoQueryLib } from '../repo/query'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

export function fetch(url: string, queryId?: string): string {
  let result: string = '<tbml></tbml>'
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
    throw new Error( `Failed with status ${status} while fetching tbml data from ${url}`)
  }

  if (queryId) {
    logUserDataQuery(queryId, {
      message: Events.REQUESTING_DATA,
      response: response,
      request: {
        url
      }
    })
  }
  return result
}

export function getTbmlData(url: string, queryId?: string): TbmlData {
  return xmlToJson(fetch(url, queryId), queryId)
}

function xmlToJson(xml: string, queryId?: string): TbmlData {
  try {
    const result: TbmlData = __.toNativeObject(xmlParser.parse(xml))
    if (queryId) {
      logUserDataQuery(queryId, {
        message: Events.XML_TO_JSON
      })
    }
    return result
  } catch (e) {
    throw new Error( `Failed while parsing tbml data: ${e}`)
  }
}

export interface TbmlLib {
  fetch: (url: string, queryId?: string) => string;
  getTbmlData: (url: string, queryId?: string) => TbmlData;
}
