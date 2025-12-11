import { type Request, type Response } from '@enonic-types/core'
import { getNews } from '/lib/ssb/rss/news'

export function get(req: Request): Response {
  const days = (req.params?.days as string | undefined) ?? '90'

  return {
    body: getNews(Number(days)),
    contentType: 'application/json',
  }
}
