import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const get = (): XP.Response => {
  const conn = connectMarkdownRepo()

  const result = conn.findChildren({
    parentKey: '/',
    count: 100,
  })

  const markdownNodes = result.hits.map((hit) => {
    const node = conn.get(hit.id)
    return {
      id: hit.id,
      displayName: node.displayName,
    }
  })

  const body = {
    count: result.count,
    total: result.total,
    hits: markdownNodes,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}
