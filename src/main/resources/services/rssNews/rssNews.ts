import { getNews } from '/lib/ssb/rss/news'

export function get(req: XP.Request): XP.Response {
  const days: string = req.params.days ?? '90'

  return {
    body: getNews(Number(days)),
    contentType: 'application/json',
  }
}
