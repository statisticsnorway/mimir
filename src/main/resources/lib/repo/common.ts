import { ContextLibrary } from 'enonic-types/context'
import { AuthLibrary, User } from 'enonic-types/auth'
import { NodeCreateParams,
  NodeLibrary,
  NodeQueryParams,
  NodeQueryResponse,
  RepoConnection,
  RepoNode } from 'enonic-types/node'
import { EditorCallback } from './eventLog'

const auth: AuthLibrary = __non_webpack_require__( '/lib/xp/auth')
const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const node: NodeLibrary = __non_webpack_require__('/lib/xp/node')

const ENONIC_CMS_DEFAULT_REPO: string = 'com.enonic.cms.default'
const SYSADMIN_ROLE: string = 'role:system.admin'

export type ContextCallback<T> = () => T;
export type UserContextCallback<T> = (user: User | null) => T;
export type ConnectionCallback<T> = (conn: RepoConnection) => T;

const SUPER_USER: User = {
  login: 'su',
  displayName: 'su',
  idProvider: 'system'
} as User

export interface LoggedInUser {
  readonly login: string;
  readonly idProvider?: string | undefined;
}

export function withSuperUserContext<T>(repository: string, branch: string, callback: ContextCallback<T>): T {
  return context.run({
    repository,
    branch,
    user: SUPER_USER
  }, callback)
}

export function withLoggedInUserContext<T>(branch: string, callback: UserContextCallback<T>): T {
  const user: User | null = auth.getUser()
  const loggedInUser: LoggedInUser = {
    login: user ? user.login : '',
    idProvider: user?.idProvider
  }
  return context.run({
    repository: ENONIC_CMS_DEFAULT_REPO,
    branch,
    user: loggedInUser,
    principals: [SYSADMIN_ROLE]
  }, () => callback(user))
}

function getConnection(repository: string, branch: string): RepoConnection {
  return withSuperUserContext<RepoConnection>(repository, branch, () => {
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

export function getNode<T>(repository: string, branch: string, key: string): ReadonlyArray<T & RepoNode> | T & RepoNode | null {
  return withConnection(repository, branch, (conn) => {
    return conn.get(key)
  })
}

export function deleteNode(repository: string, branch: string, key: string): boolean {
  return withConnection(repository, branch, (conn) => {
    return conn.delete(key).length === 1
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

export function getChildNodes(repository: string, branch: string, key: string, count: number = 10): NodeQueryResponse<never> {
  return withConnection(repository, branch, (conn) => {
    return conn.findChildren({
      parentKey: key,
      count
    })
  })
}

export function nodeExists(repository: string, branch: string, key: string): boolean {
  return withConnection(repository, branch, (conn) => {
    return !!conn.exists(key)
  })
}

export function queryNodes(repository: string, branch: string, params: NodeQueryParams<never>): NodeQueryResponse<never> {
  return withConnection(repository, branch, (conn) => {
    return conn.query(params)
  })
}

export interface RepoCommonLib {
  withSuperUserContext: <T>(repository: string, branch: string, callback: ContextCallback<T>) => T;
  withLoggedInUserContext: <T>(branch: string, callback: UserContextCallback<T>) => T;
  withConnection: <T>(repository: string, branch: string, callback: ConnectionCallback<T>) => T;
  createNode: <T>(repository: string, branch: string, content: T & NodeCreateParams) => T & RepoNode;
  getNode: <T>(repository: string, branch: string, key: string) => ReadonlyArray<T & RepoNode> | T & RepoNode | null;
  deleteNode: (repository: string, branch: string, key: string) => boolean;
  modifyNode: <T>(repository: string, branch: string, key: string, editor: EditorCallback<T>) => T;
  getChildNodes: (repository: string, branch: string, key: string, count?: number) => NodeQueryResponse<never>;
  nodeExists: (repository: string, branch: string, key: string) => boolean;
  queryNodes: (repository: string, branch: string, params: NodeQueryParams<never>) => NodeQueryResponse<never>;
}
