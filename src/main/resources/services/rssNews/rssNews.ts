import { getNews, getRssItemsNews } from '/lib/ssb/rss/news'

export function get(req: XP.Request): XP.Response {
  const format: string = req.params.format ?? 'json'
  return format === 'xml' ? getRssItemsXml() : getRssItemsJson()
}

function getRssItemsJson(): XP.Response {
  return {
    body: getNews(),
    contentType: 'application/json',
  }
}

function getRssItemsXml(): XP.Response {
  return {
    body: getRssItemsNews(),
    contentType: 'text/xml',
  }
}
