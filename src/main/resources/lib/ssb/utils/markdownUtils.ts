import { connect, type RepoConnection } from '/lib/xp/node'

export function connectMarkdownRepo(): RepoConnection {
  return connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin'],
  })
}
