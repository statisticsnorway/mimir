import { ContextLibrary } from 'enonic-types/lib/context'
import {NodeCreateParams, NodeLibrary, NodeQueryResponse, RepoConnection, RepoNode} from 'enonic-types/lib/node'
import { EditorCallback } from './eventLog'

const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const node: NodeLibrary = __non_webpack_require__('/lib/xp/node')

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
  return withConnection(repository, branch, (conn: RepoConnection) => {
    return conn.create(content)
  })
}

export function getNode<T>(repository: string, branch: string, key: string): ReadonlyArray<T & RepoNode> {
  return withConnection(repository, branch, (conn) => {
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

export function getChildNodes(repository: string, branch: string, key: string): NodeQueryResponse {
  return withConnection(repository, branch, (conn) => {
    return conn.findChildren({parentKey: key})
  })
}

export function nodeExists(repository: string, branch: string, key: string) {
  return withConnection(repository, branch, (conn) => {
    return conn.exists(key)
  })
}
