import { type Node } from '/lib/xp/node'
import { getMarkdownRepo, getMarkdownNode } from '/lib/ssb/utils/markdownUtils'

exports.get = (): XP.Response => {
  const markdownFileIds = getMarkdownRepo().hits.map((node: { id: string }) => `${node.id}`)
  const markdownContent = markdownFileIds.map((id: string) => getMarkdownNode(id))
  const total: number = markdownContent.length

  return {
    body: {
      count: total,
      total: total,
      hits: markdownContent.map(({ _id, _name }: Node) => {
        return {
          id: _id,
          displayName: _name,
        }
      }),
    },
    contentType: 'application/json',
  }
}
