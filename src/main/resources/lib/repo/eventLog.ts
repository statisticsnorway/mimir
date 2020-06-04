import { createNode, withConnection } from './common'
import { NodeCreateParams, RepoNode } from 'enonic-types/lib/node'
import { repoExists, createRepo } from './repo'

export const EVENT_LOG_REPO: string = 'no.ssb.eventlog'
export const EVENT_LOG_BRANCH: string = 'master'

export type EditorCallback<T> = (node: T & RepoNode) => T & RepoNode;

export function eventLogExists(): boolean {
  return repoExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH)
}

export function createEventLogRepo(): void {
  createRepo(EVENT_LOG_REPO, EVENT_LOG_BRANCH)
}

export function createEventLog<T>(content: T & NodeCreateParams, createRepoIfNotFound: boolean = true): T & RepoNode {
  if (! eventLogExists() && createRepoIfNotFound) {
    createEventLogRepo()
  }

  return createNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, content)
}

export function updateEventLog<T>(key: string, editor: EditorCallback<T> ): T & RepoNode {
  return withConnection<T & RepoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key,
      editor
    })
  })
}
