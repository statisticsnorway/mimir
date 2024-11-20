import { getStatkal, getRssItemsStatkal } from '/lib/ssb/rss/statkal'

export function get(req: XP.Request): XP.Response {
  const format: string = req.params.format ?? 'json'
  return format === 'xml' ? getRssItemsXml() : getRssItemsJson()
}

function getRssItemsJson(): XP.Response {
  return {
    body: getStatkal(),
    contentType: 'application/json',
  }
}

function getRssItemsXml(): XP.Response {
  return {
    body: getRssItemsStatkal(),
    contentType: 'text/xml',
  }
}
