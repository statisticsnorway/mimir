import { ContextLibrary } from 'enonic-types/lib/context'
import { NodeCreateParams, NodeLibrary, RepoConnection, RepoNode } from 'enonic-types/lib/node'
import { RepositoryConfig, RepoLibrary } from 'enonic-types/lib/repo'
import {EVENT_LOG_BRANCH, EVENT_LOG_REPO} from './eventLog';
import { EditorCallback } from './eventLog'

const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const node: NodeLibrary = __non_webpack_require__('/lib/xp/node')
const repo: RepoLibrary = __non_webpack_require__('/lib/xp/repo')

export type ContextCallback<T> = () => T;
export type ConnectionCallback<T> = (conn: RepoConnection) => T;

export type QueryFilters = {
  [key: string]: string;
} | null;

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

export function createNode<T>(repository: string, branch: string, content: T & NodeCreateParams): T & RepoNode {
  return withConnection(repository, branch, (conn) => {
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

export function getNode<T>(repository: string, branch: string, key: string): ReadonlyArray<T & RepoNode> {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.get(key)
  })
}

export function deleteNode(repository: string, branch: string, key: string): boolean {
  return withConnection(repository, branch, (conn) => {
    return conn.delete(key)
  })
}

export function modifyNode<T>(repository: string, branch: string, key: string, editor: EditorCallback<T>): T {
  return withConnection(repository, branch, (conn) => {
    return conn.modify({
      key,
      editor
    })
  })
}

