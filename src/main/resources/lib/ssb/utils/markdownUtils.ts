import { NodeQueryResponse, RepoConnection, RepoNode } from 'enonic-types/node'

const MARKDOWN_REPO: string = 'no.ssb.pubmd'
const MARKDOWN_BRANCH: string = 'master'

const {
  connect
} = __non_webpack_require__('/lib/xp/node')
const {
  getNode
} = __non_webpack_require__('/lib/ssb/repo/common')

export function connectMarkdownRepo(): RepoConnection {
  return connect({
    repoId: MARKDOWN_REPO,
    branch: MARKDOWN_BRANCH,
    principals: ['role:system.admin']
  })
}

export function getMarkdownRepo(): NodeQueryResponse<never> {
  return connectMarkdownRepo().findChildren({
    parentKey: '/',
    count: 1000
  })
}

export function getMarkdownNode(id: string): ReadonlyArray<RepoNode> | RepoNode | null {
  return getNode(MARKDOWN_REPO, MARKDOWN_BRANCH, id)
}
