import { Request, Response } from 'enonic-types/controller'
import { PreparedArticles, ArticleResult } from '../../lib/ssb/utils/articleUtils'

const {
  getAllArticles
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')

exports.get = (req: Request): Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 10
  const language: string = req.params?.language ? req.params.language : 'nb'
  const allArticles: ArticleResult = getAllArticles(req, language, start, count)
  const index: number = start + count

  const articleListHtml: string =
  `<div>
        <p>Viser fra ${start} til ${index} (Totalt antall artikler ${allArticles.total})</p>
        <div>
            ${allArticles.articles.map((article: PreparedArticles) =>`<a href="${article.url}">${article.title}</a>`).join('</br>')}
        </div>
        <p>
            <a href="/_/service/mimir/solrArticleList?start=${index}&count=${count}">Flere artikler (Start: ${index} Antall: ${count})</a>
        </p>
    </div>`


  return {
    body: articleListHtml,
    contentType: 'text/html'
  }
}
