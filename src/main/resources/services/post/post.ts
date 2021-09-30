import { Request } from 'enonic-types/controller'
import { RepoConnection, RepoNode } from 'enonic-types/node'
import { connectMarkdownRepo } from '../../lib/ssb/utils/markdownUtils'

export function post(req: Request): void {
  const repo: RepoConnection = connectMarkdownRepo()
  const path: string = req.params.path ? req.params.path : '/'
  const nodeKey: string = req.params.path ? req.params.path + '/' + req.params.name : '/' + req.params.name
  const nodeExists: readonly string[] = repo.exists(nodeKey)
  if (nodeExists) {
    repo.modify({
      key: nodeKey,
      editor: (node: MarkdownRepoNode) => {
        node.markdown = req.body
        return node
      }
    })
  } else {
    repo.create({
      _name: req.params.name,
      _parentPath: path,
      markdown: req.body

    })
  }
}

interface MarkdownRepoNode extends RepoNode {
  markdown?: string;
}
