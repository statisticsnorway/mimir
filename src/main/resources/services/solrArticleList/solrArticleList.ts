import { getAllArticles } from '/lib/ssb/utils/articleUtils'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type ArticleResult, type PreparedArticles } from '/lib/types/article'
import { type PublicationItem } from '/lib/types/partTypes/publicationArchive'

export const get = (req: XP.Request): XP.Response => {
  const articleLanguage: 'en' | 'no' = req.params.language === 'en' ? 'en' : 'no'
  const publicationLanguage: 'en' | 'nb' = articleLanguage === 'en' ? 'en' : 'nb'
  const pageSize: any = 1000
  const txtMode = req.params.format === 'txt'

  const seen: { [url: string]: 1 } = {}
  const urls: string[] = []
  const add = (url?: string) => {
    if (url && !seen[url]) {
      seen[url] = 1
      urls.push(url)
    }
  }

  // Articles
  let totalArticles = 0,
    collectedArticles = 0,
    startA = 0
  while (true) {
    const res: ArticleResult = getAllArticles(req, articleLanguage, startA as any, pageSize)
    if (startA === 0) totalArticles = res.total || 0
    const hits = (res.articles as PreparedArticles[]) || []
    for (let i = 0; i < hits.length; i++) add(hits[i].url)
    collectedArticles += hits.length
    if (startA + pageSize >= totalArticles) break
    startA += pageSize
  }

  // Statistics-only publications
  let totalPubs = 0,
    collectedPubs = 0,
    startP = 0
  while (true) {
    const resP = getPublications(req, startP, pageSize, publicationLanguage, 'statistics')
    if (startP === 0) totalPubs = resP.total || 0
    const pubs = (resP.publications as PublicationItem[]) || []
    for (let j = 0; j < pubs.length; j++) add(pubs[j].url)
    collectedPubs += pubs.length
    if (startP + pageSize >= totalPubs) break
    startP += pageSize
  }

  // O(n) output
  if (txtMode) {
    return { body: urls.join('\n'), contentType: 'text/plain; charset=UTF-8', headers: { 'X-Robots-Tag': 'noindex' } }
  }

  const body = `<!DOCTYPE html>
<html lang="${articleLanguage}">
<head>
<meta charset="UTF-8"/><meta name="robots" content="noindex"/>
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
  <p>Articles ${collectedArticles}/${totalArticles} • Statistics ${collectedPubs}/${totalPubs}</p>
</div>
<div>${urls.map((u) => '<div class="url"><a href="' + u + '">' + u + '</a></div>').join('')}</div>
</main>
</body>
</html>`

  return { body, contentType: 'text/html; charset=UTF-8', headers: { 'X-Robots-Tag': 'noindex' } }
}
