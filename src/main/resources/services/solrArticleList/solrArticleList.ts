import { getAllArticles } from '/lib/ssb/utils/articleUtils'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type ArticleResult, type PreparedArticles } from '/lib/types/article'
import { type PublicationItem } from '/lib/types/partTypes/publicationArchive'
import { collectUrls } from '/lib/ssb/utils/solrUtils'

export const get = (req: XP.Request): XP.Response => {
  const articleLanguage: 'en' | 'no' = req.params.language === 'en' ? 'en' : 'no'
  const publicationLanguage: 'en' | 'nb' = articleLanguage === 'en' ? 'en' : 'nb'
  const pageSize = 1000
  const txtMode = req.params.format === 'txt'

  const seen: Record<string, 1> = {}
  const urls: string[] = []

  // Articles
  const articlesStats = collectUrls<PreparedArticles>(
    (start) => {
      const res: ArticleResult = getAllArticles(req, articleLanguage, start, pageSize)
      return { total: res.total, items: (res.articles as PreparedArticles[]) || [] }
    },
    (article) => article.url,
    seen,
    urls,
    pageSize
  )

  // Publications
  const publicationsStats = collectUrls<PublicationItem>(
    (start) => {
      const res = getPublications(req, start, pageSize, publicationLanguage, 'statistics')
      return { total: res.total, items: (res.publications as PublicationItem[]) || [] }
    },
    (pub) => pub.url,
    seen,
    urls,
    pageSize
  )

  // Text output
  if (txtMode) {
    return {
      body: urls.join('\n'),
      contentType: 'text/plain; charset=UTF-8',
      headers: { 'X-Robots-Tag': 'noindex' },
    }
  }

  // HTML output
  const body = `<!DOCTYPE html>
<html lang="${articleLanguage}">
<head>
<meta charset="UTF-8"/>
<meta name="robots" content="noindex"/>
<title>Solr URLs</title>
<style>
html,body{background:#000;color:#fff;margin:0;padding:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;line-height:1.5}
main{padding:20px}.meta{margin:0 0 12px 0}.url{margin:2px 0;word-break:break-all}
a{color:#fff;text-decoration:none}a:hover{text-decoration:underline}
</style>
</head>
<body>
<main>
<div class="meta">
  <p><strong>Total URLs:</strong> ${urls.length}</p>
  <p>Articles ${articlesStats.collected}/${articlesStats.total} • Statistics ${publicationsStats.collected}/${publicationsStats.total}</p>
</div>
<div>${urls.map((u) => `<div class="url"><a href="${u}">${u}</a></div>`).join('')}</div>
</main>
</body>
</html>`

  return {
    body,
    contentType: 'text/html; charset=UTF-8',
    headers: { 'X-Robots-Tag': 'noindex' },
  }
}
