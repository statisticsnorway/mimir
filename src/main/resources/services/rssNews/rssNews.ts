import { getNews } from '/lib/ssb/rss/news'

export function get(): XP.Response {
  const news = getNews()
  return {
    body: news,
    contentType: 'application/json',
  }
}
