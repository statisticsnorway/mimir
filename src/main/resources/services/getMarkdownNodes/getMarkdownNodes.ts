import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const get = (): XP.Response => {
  const conn = connectMarkdownRepo()

  const markdownNodes = conn.findChildren({
    parentKey: '/',
    count: 100,
  })

  const body = {
    count: markdownNodes.count,
    total: markdownNodes.total,
    hits: markdownNodes.hits,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}
