import { Request, Response } from 'enonic-types/controller'
import { PreparedArticles, ArticleResult } from '../../lib/ssb/utils/articleUtils'

const {
  getAllArticles
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 50
  const language: string = req.params.language && req.params.language === 'en' ? 'en' : 'no'
  const allArticles: ArticleResult = getAllArticles(req, language, start, count)
  const articleStart: number = start + 1
  const articleEnd: number = allArticles.total > start + count ? start + count : allArticles.total
  const articleStartNext: number = articleStart + count
  const articleEndNext: number = articleEnd + count < allArticles.total ? articleEnd + count : allArticles.total

  const articleListHtml: string =
  `<!DOCTYPE html>
    <html lang="${language}">
        <head><meta charset="UTF-8"/></head>
        <body>
          <div>
              <p>Artikkel ${articleStart} til ${articleEnd} (Totalt antall artikler ${allArticles.total})</p>
              <div>
                  ${allArticles.articles.map((article: PreparedArticles) =>`<a href="${article.url}">${article.title}</a>`).join('</br>')}
              </div>
              ${allArticles.total > start + count ?
    `<p>
              <a href="/_/service/mimir/solrArticleList?start=${start + count}&count=${count}">Flere artikler (${articleStartNext}  til  ${articleEndNext})</a>
          </p>` : ''}
            </div>
        </body>
    </html>`


  return {
    body: articleListHtml,
    contentType: 'text/html'
  }
}
