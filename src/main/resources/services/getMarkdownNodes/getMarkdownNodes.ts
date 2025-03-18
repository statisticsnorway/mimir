import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const get = (): XP.Response => {
  const conn = connectMarkdownRepo()

  const markdownNodes = conn.findChildren({
    parentKey: '/',
    count: 100,
  })

  const hits = markdownNodes.hits.map((hit) => {
    const node = conn.get(hit.id)
    return {
      id: hit.id,
      displayName: node.displayName,
    }
  })

  const body = {
    count: markdownNodes.count,
    total: markdownNodes.total,
    hits: hits,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}
