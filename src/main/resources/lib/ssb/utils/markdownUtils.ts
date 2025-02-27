const MARKDOWN_REPO: string = 'no.ssb.pubmd'
const MARKDOWN_BRANCH: string = 'master'

import { connect, RepoConnection } from '/lib/xp/node'
import { getNode } from '/lib/ssb/repo/common'

export function connectMarkdownRepo(): RepoConnection {
  return connect({
    repoId: MARKDOWN_REPO,
    branch: MARKDOWN_BRANCH,
    principals: ['role:system.admin'],
  })
}

export function getMarkdownRepo() {
  return connectMarkdownRepo().findChildren({
    parentKey: '/',
    count: 1000,
  })
}

export function getMarkdownNode(id: string) {
  return getNode(MARKDOWN_REPO, MARKDOWN_BRANCH, id)
}

export interface MarkdownRepoNode extends Node {
  markdown?: string
}
