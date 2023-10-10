import { getUser, User, type PrincipalKey } from '/lib/xp/auth'
import {
  connect,
  RepoConnection,
  type Node,
  type CreateNodeParams,
  type QueryNodeParams,
  type FindNodesByParentResult,
  type NodeQueryResult,
} from '/lib/xp/node'
import { run } from '/lib/xp/context'
import { EditorCallback } from '/lib/ssb/repo/eventLog'

const ENONIC_PROJECT_ID: string = app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'
export const ENONIC_CMS_DEFAULT_REPO = `com.enonic.cms.${ENONIC_PROJECT_ID}`
const SYSADMIN_ROLE: PrincipalKey = 'role:system.admin'

export type ContextCallback<T> = () => T
export type UserContextCallback<T> = (user: User | null) => T
export type ConnectionCallback<T> = (conn: RepoConnection) => T

const SUPER_USER: User = {
  login: 'su',
  displayName: 'su',
  idProvider: 'system',
} as User

export interface LoggedInUser {
  readonly login: string
  readonly idProvider?: string | undefined
}

export function withSuperUserContext<T>(repository: string, branch: string, callback: ContextCallback<T>): T {
  return run(
    {
      repository,
      branch,
      user: SUPER_USER,
    },
    callback
  )
}

export function withLoggedInUserContext<T>(branch: string, callback: UserContextCallback<T>): T {
  const user: User | null = getUser()
  const loggedInUser: LoggedInUser = {
    login: user ? user.login : '',
    idProvider: user?.idProvider,
  }
  return run(
    {
      repository: ENONIC_CMS_DEFAULT_REPO,
      branch,
      user: loggedInUser,
      principals: [SYSADMIN_ROLE],
    },
    () => callback(user)
  )
}

function getConnection(repository: string, branch: string): RepoConnection {
  return withSuperUserContext<RepoConnection>(repository, branch, () => {
    return connect({
      repoId: repository,
      branch,
    })
  })
}

export function withConnection<T>(repository: string, branch: string, callback: ConnectionCallback<T>): T {
  return callback(getConnection(repository, branch))
}

export function createNode<T>(repository: string, branch: string, content: T & CreateNodeParams): T & Node {
  return withConnection(repository, branch, (conn: RepoConnection) => {
    return conn.create(content)
  })
}

export function getNode(repository: string, branch: string, key: string | Array<string>) {
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
      editor,
    })
  })
}

export function getChildNodes(
  repository: string,
  branch: string,
  key: string,
  count = 10,
  countOnly = false,
  childOrder = '_ts DESC'
) {
  return withConnection(repository, branch, (conn) => {
    // @ts-ignore https://github.com/enonic/xp/issues/10138
    return conn.findChildren({
      parentKey: key,
      count,
      childOrder,
      countOnly,
    })
  })
}

export function nodeExists(repository: string, branch: string, key: string): boolean {
  return withConnection(repository, branch, (conn) => {
    return !!conn.exists(key)
  })
}

export function queryNodes(repository: string, branch: string, params: QueryNodeParams) {
  return withConnection(repository, branch, (conn) => {
    return conn.query(params)
  })
}
