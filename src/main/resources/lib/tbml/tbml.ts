import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { TbmlData, XmlParser } from '../types/xmlParser'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')

export function fetch(url: string): string {
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

  return result
}

export function getTbmlData(url: string): TbmlData {
  return xmlToJson(fetch(url))
}

function xmlToJson(xml: string): TbmlData {
  const result: TbmlData = __.toNativeObject(xmlParser.parse(xml))
  return result
}
