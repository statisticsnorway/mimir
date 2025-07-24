import { connect, type RepoConnection } from '/lib/xp/node'

export function connectMarkdownRepo(): RepoConnection {
  return connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.authenticated'],
  })
}

export function getMarkdownNode(nodeId: string, conn?: RepoConnection) {
  if (!conn) {
    conn = connectMarkdownRepo()
  }
  return conn.get(nodeId)
}

export function getMarkdownText(nodeId: string): string {
  const node = getMarkdownNode(nodeId)
  const markdownText = node?.markdown
  return typeof markdownText == 'string' ? markdownText : ''
}
