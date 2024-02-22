import { parseArticleData, ParsedArticles } from '/site/parts/articleArchive/articleArchive'

export const get = (req: XP.Request): XP.Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 15
  const language: string = req.params.language ? req.params.language : 'nb'
  const pageId: string = req.params.pageId ? req.params.pageId : ''

  const parsedArticles: ParsedArticles = parseArticleData(pageId, start, count, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: parsedArticles,
  }
}
