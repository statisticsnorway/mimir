import { getNews, getRssItemsNews } from '/lib/ssb/rss/news'

export function get(req: XP.Request): XP.Response {
  const format: string = req.params.format ?? 'json'
  const days: string = req.params.days ?? '90'
  const isXml = format === 'xml'
  return {
    body: isXml ? getRssItemsNews(Number(days)) : getNews(Number(days)),
    contentType: isXml ? 'text/xml' : 'application/json',
  }
}
