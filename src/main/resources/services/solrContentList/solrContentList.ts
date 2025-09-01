import { getAllArticles } from '/lib/ssb/utils/articleUtils'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type ArticleResult, type PreparedArticles } from '/lib/types/article'
import { type PublicationItem } from '/lib/types/partTypes/publicationArchive'
import { collectUrls } from '/lib/ssb/utils/solrUtils'

export const get = (req: XP.Request): XP.Response => {
  const articleLanguage: 'en' | 'no' = req.params.language === 'en' ? 'en' : 'no'
  const publicationLanguage: 'en' | 'nb' = articleLanguage === 'en' ? 'en' : 'nb'
  const pageSize = 1000

  // Articles
  const articlesStats = collectUrls<PreparedArticles>(
    (start, pageSize) => {
      const res: ArticleResult = getAllArticles(req, articleLanguage, start, pageSize)
      return { total: res.total, items: (res.articles as PreparedArticles[]) || [] }
    },
    (article) => article.url,
    pageSize
  )

  // Publications
  const publicationsStats = collectUrls<PublicationItem>(
    (start, pageSize) => {
      const res = getPublications(req, start, pageSize, publicationLanguage, 'statistics')
      return { total: res.total, items: (res.publications as PublicationItem[]) || [] }
    },
    (pub) => pub.url,
    pageSize
  )

  // merge
  const urls = [...articlesStats.urls, ...publicationsStats.urls]

  // HTML output
  const body = `<!DOCTYPE html>
  <html lang="${articleLanguage}">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <title>Solr URLs</title>
  </head>
  <body>
    <main>
      <div class="meta">
        <p><strong>Total URLs:</strong> ${urls.length}</p>
        <p>
          Articles ${articlesStats.collected}/${articlesStats.total} •
          Statistics ${publicationsStats.collected}/${publicationsStats.total}
        </p>
      </div>
      <div>
        ${urls.map((u, i) => `<div class="url">${i + 1}. <a href="${u}">${u}</a></div>`).join('')}
      </div>
    </main>
  </body>
  </html>`

  return {
    body,
    contentType: 'text/html; charset=UTF-8',
    headers: { 'X-Robots-Tag': 'noindex' },
  }
}
