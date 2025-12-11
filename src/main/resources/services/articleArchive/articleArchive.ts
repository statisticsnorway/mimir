import { type Request, type Response } from '@enonic-types/core'
import { type ParsedArticles } from '/lib/types/partTypes/articleArchive'
import { parseArticleData } from '/site/parts/articleArchive/articleArchive'

export const get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 15
  const language = req.params.language ? (req.params.language as string) : 'nb'
  const pageId = req.params.pageId ? (req.params.pageId as string) : ''

  const parsedArticles: ParsedArticles = parseArticleData(pageId, start, count, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: parsedArticles,
  }
}
