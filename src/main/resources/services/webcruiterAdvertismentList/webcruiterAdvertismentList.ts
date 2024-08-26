import { request } from '/lib/http-client'
import { type XmlParser } from '/lib/types/xmlParser'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export function fetchWebcruiterAdvertismentListRSSFeed(url: string) {
  try {
    const response = request({
      url,
      method: 'GET',
      connectionTimeout: 60000,
      readTimeout: 60000,
    })

    const xmlToJSON = xmlParser.parse(response?.body as string)
    const parsedJSON = JSON.parse(xmlToJSON)

    log.info(JSON.stringify(parsedJSON, null, 2))
    return parsedJSON
  } catch (e) {
    log.error(e)
  }
}
