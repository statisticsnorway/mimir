import { type Request, type Response } from '@enonic-types/core'
import { getContent } from '/lib/xp/portal'
import { getChildArticles, getSubtopics, prepareArticles } from '/lib/ssb/utils/articleUtils'
import { type PreparedArticles } from '/lib/types/article'

let totalCount = 0

export const get = (req: Request): Response => {
  const currentPath = req.params.currentPath ? (req.params.currentPath as string) : '/'
  const start = Number(req.params.start) ? Number(req.params.start) : 0
  const count = Number(req.params.count) ? Number(req.params.count) : 10
  const sort = req.params.sort ? (req.params.sort as string) : 'DESC'
  const language = req.params?.language
    ? req.params.language === 'en'
      ? 'en-gb'
      : (req.params.language as string)
    : 'nb'
  const content = getContent()
  if (!content) {
    return {
      status: 404,
    }
  }
  const subTopicIds: string | string[] = getSubtopics(content, currentPath, req, language)
  const childArticles = getChildArticles(currentPath, subTopicIds, start, count, sort)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(childArticles.hits, language)
  totalCount = childArticles.total

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      articles: preparedArticles,
      totalCount: totalCount,
    },
  }
}
