import { ContextLibrary } from 'enonic-types/lib/context'
import { NodeLibrary, RepoConnection } from 'enonic-types/lib/node'
import { RepositoryConfig, RepoLibrary } from 'enonic-types/lib/repo'

const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const node: NodeLibrary = __non_webpack_require__('/lib/xp/node')
const repo: RepoLibrary = __non_webpack_require__('/lib/xp/repo')

export type ContextCallback<T> = () => T;
export type ConnectionCallback<T> = (conn: RepoConnection) => T;

export interface SuperUser {
    login: string;
    idProvider: string;
}

export const SUPER_USER: SuperUser = {
  login: 'su',
  idProvider: 'system'
}

export function withUserContext<T>(repository: string, branch: string, callback: ContextCallback<T>): T {
  return context.run({
    repository,
    branch,
    user: SUPER_USER
  }, callback)
}

export function getConnection(repository: string, branch: string): RepoConnection {
  return withUserContext<RepoConnection>(repository, branch, () => {
    return node.connect({
      repoId: repository,
      branch
    })
  })
}

export function withConnection<T>(repository: string, branch: string, callback: ConnectionCallback<T>): T {
  return callback(getConnection(repository, branch))
}

export function createNode(repository: string, branch: string, content: object): object {
  return withConnection<object>(repository, branch, (conn) => {
    return conn.create(content)
  })
}

export function createRepo(repository: string, branch: string): RepositoryConfig {
  return withUserContext<RepositoryConfig>(repository, branch, () => {
    return repo.create({
      id: repository
    })
  })
}
