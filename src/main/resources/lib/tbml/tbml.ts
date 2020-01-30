import { HttpLibrary } from 'enonic-types/lib/http'
import { TbmlData, XmlParser } from '../types/xmlParser'
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')

export function fetch(url: string): string {
  let result: string = '<tbml></tbml>'

  try {
    const body: string | null = http.request({
      url
    }).body

    if (body) {
      result = body
    }
  } catch (e) {
    log.error('Failed fetching ')
    log.error(e)
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
