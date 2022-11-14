import { PreparedArticles, ArticleResult } from '../../lib/ssb/utils/articleUtils'

const { getAllArticles } = __non_webpack_require__('/lib/ssb/utils/articleUtils')

exports.get = (req: XP.Request): XP.Response => {
  const start: number = Number(req.params.start) ? Number(req.params.start) : 0
  const count: number = Number(req.params.count) ? Number(req.params.count) : 50
  const language: string = req.params.language && req.params.language === 'en' ? 'en' : 'no'
  const allArticles: ArticleResult = getAllArticles(req, language, start, count)
  const articleStart: number = start + 1
  const articleEnd: number = start + allArticles.articles.length
  const moreArticlesUrl = `/_/service/mimir/solrArticleList?language=${language}&start=${start + count}&count=${count}`

  const articleListHtml = `<!DOCTYPE html>
    <html lang="${language}">
        <head>
            <meta charset="UTF-8"/>
            <meta name="robots" content="noindex" />
        </head>
        <body>
          <div>
              <p>Artikkel ${articleStart} til ${articleEnd} (Totalt antall artikler ${allArticles.total})</p>
              <div>
                  ${allArticles.articles
                    .map((article: PreparedArticles) => `<a href="${article.url}">${article.title}</a>`)
                    .join('</br>')}
              </div>
              ${
                allArticles.total > start + count
                  ? `<p>
              <a href="${moreArticlesUrl}">Neste ${count} artikler</a>
          </p>`
                  : ''
              }
            </div>
        </body>
    </html>`

  return {
    body: articleListHtml,
    contentType: 'text/html',
  }
}
