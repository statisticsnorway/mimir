import { Content } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'

const {
  getMarkdownRepo, getMarkdownNode
} = __non_webpack_require__('/lib/ssb/utils/markdownUtils')

exports.get = (): Response => {
  const markdownFileIds: Array<string> = getMarkdownRepo().hits.map((node: {id: string}) => `${node.id}`)
  const markdownContent: Array<Content> = markdownFileIds.map((id: string) => getMarkdownNode(id))
  const total: number = markdownContent.length

  return {
    body: {
      count: total,
      total: total,
      hits: markdownContent.map(({
        _id, _name
      }) => {
        return {
          id: _id,
          displayName: _name
        }
      })
    },
    contentType: 'application/json'
  }
}
