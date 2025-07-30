// File: src/main/resources/services/solrArchive/solrArchive.ts

import { render } from '/lib/thymeleaf'
import { pageUrl } from '/lib/xp/portal'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type PublicationItem } from '/lib/types/partTypes/publicationArchive'

export function get(req: XP.Request): XP.Response {
  const urls: string[] = []
  const batchSize = 200
  let start = 0
  let result

  do {
    result = getPublications(req, start, batchSize, 'nb')
    for (const pub of result.publications as PublicationItem[]) {
      urls.push(pageUrl({ path: pub.url, type: 'absolute' }))
    }
    start += batchSize
  } while (start < result.total)
  log.info(`solrArchive: collected ${urls.length} URLs`)

  return {
    body: render(resolve('./solrArchive.html'), { urls }),
    contentType: 'text/html',
  }
}
