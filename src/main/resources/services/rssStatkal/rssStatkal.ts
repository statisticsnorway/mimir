import { getRssReleasesStatkal, getRssItemsStatkal } from '/lib/ssb/rss/statkal'

export function get(req: XP.Request): XP.Response {
  const format: string = req.params.format ?? 'json'
  const isXml = format === 'xml'
  return {
    body: isXml ? getRssItemsStatkal() : getRssReleasesStatkal(),
    contentType: isXml ? 'text/xml' : 'application/json',
  }
}
