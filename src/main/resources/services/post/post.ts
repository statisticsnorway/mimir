import { type RepoConnection, type Node } from '/lib/xp/node'
import { connectMarkdownRepo, type MarkdownRepoNode } from '/lib/ssb/utils/markdownUtils'

export function post(req: XP.Request): void {
  const repo: RepoConnection = connectMarkdownRepo()
  const path: string = req.params.path ? req.params.path : '/'
  const nodeKey: string = req.params.path ? req.params.path + '/' + req.params.name : '/' + req.params.name
  const nodeExists: boolean = repo.exists(nodeKey)
  if (nodeExists) {
    repo.modify({
      key: nodeKey,
      editor: (node: Node<MarkdownRepoNode>) => {
        node.markdown = req.body
        return node
      },
    })
  } else {
    repo.create({
      _name: req.params.name,
      _parentPath: path,
      markdown: req.body,
    })
  }
}
