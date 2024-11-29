import { getNews, getRssItemsNews } from '/lib/ssb/rss/news'

export function get(req: XP.Request): XP.Response {
  const format: string = req.params.format ?? 'json'
  const isXml = format === 'xml'
  return {
    body: isXml ? getRssItemsNews() : getNews(),
    contentType: isXml ? 'text/xml' : 'application/json',
  }
}
