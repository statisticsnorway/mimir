import { render } from '/lib/thymeleaf'
import { getPublications } from '/lib/ssb/parts/publicationArchive'
import { type PublicationItem } from '/lib/types/partTypes/publicationArchive'

export function get(req: XP.Request): XP.Response {
  const host = req.headers?.host || req.headers?.Host || 'www.ssb.no'
  const baseUrl = `${req.scheme}://${host}`
  const urls: string[] = []

  //call
  for (let start = 0, batch; ; start += 200) {
    batch = getPublications(req, start, 200, 'nb')
    urls.push(...(batch.publications as PublicationItem[]).map((pub) => `${baseUrl}${pub.url}`))
    if (start + 200 >= batch.total) break
  }

  log.info('solrArchive: collected %s URLs', urls.length)

  return {
    body: render(resolve('./solrArchive.html'), { urls }),
    contentType: 'text/html',
  }
}
