import { request } from '/lib/http-client'
import { type XmlParser } from '/lib/types/xmlParser'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export function fetchWebcruiterAdvertisementListRSSFeed(url: string) {
  const response = request({
    url,
    method: 'GET',
    connectionTimeout: 60000,
    readTimeout: 60000,
  })

  const xmlToJSON = xmlParser.parse(response?.body as string)
  const parseJSON = JSON.parse(xmlToJSON)
  return {
    status: response?.status,
    message: response?.message,
    body: Object.keys(parseJSON).length ? parseJSON : response?.body,
    application: 'application/json',
  }
}
