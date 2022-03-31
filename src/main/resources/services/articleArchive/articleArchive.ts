import { Request, Response } from 'enonic-types/controller'
import { QueryResponse } from 'enonic-types/content'
const {
  query
} = __non_webpack_require__('/lib/xp/content')
import { Article } from '../../site/content-types/article/article'
import { parseArticleData, ParsedArticleData } from '../../site/parts/articleArchive/articleArchive'

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params.language ? req.params.language : 'nb'
  const pageId: string = req.params.pageId ? req.params.pageId : ''

  const articlesWithArticleArchivesSelected: QueryResponse<Article> = query({
    count: 1000,
    sort: 'publish.from DESC',
    query: `data.articleArchive = "${pageId}"`,
    contentTypes: [
      `${app.name}:article`
    ]
  })
  const parsedArticles: Array<ParsedArticleData> = parseArticleData(articlesWithArticleArchivesSelected, language)

  return {
    status: 200,
    contentType: 'application/json',
    body: {
      articles: parsedArticles.slice(start, start + count),
      totalCount: parsedArticles.length
    }
  }
}
