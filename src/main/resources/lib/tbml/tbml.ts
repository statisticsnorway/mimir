import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { TbmlData, XmlParser } from '../types/xmlParser'

const { Events, logUserDataQuery } = __non_webpack_require__( '/lib/repo/query')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')

export function fetch(url: string, queryId?: string): string {
  let result: string = '<tbml></tbml>'
  log.info('Fetch '+ url + ' and queryId ' + queryId )
  const response: HttpResponse = http.request({
    url
  })
  log.info('%s', JSON.stringify('response', null, 2))
  log.info('%s', JSON.stringify(response, null, 2))
  const {
    body,
    status
  } = response

  if (queryId) {
    logUserDataQuery(queryId, {
      message: Events.REQUESTING_DATA,
      response: response,
      request: {
        url
      }
    })
  }

  if (status === 200 && body) {
    result = body
  } else {
    throw new Error( `Failed with status ${status} while fetching tbml data from ${url}`)
  }

  return result
}

export function getTbmlData(url: string, queryId?: string): TbmlData {
  return xmlToJson(fetch(url, queryId), queryId)
}

function xmlToJson(xml: string, queryId?: string): TbmlData {
  const result: TbmlData = __.toNativeObject(xmlParser.parse(xml))
  if (queryId) {
    logUserDataQuery(queryId, {
      message: Events.XML_TO_JSON,
      xmlResult: result
    })
  }
  return result
}
