import { createNode, withConnection } from './common';
import { JobInfo } from './job';
import { RepoNode } from 'enonic-types/lib/node';
import { repoExists } from './repo';

export const EVENT_LOG_REPO: string = 'no.ssb.eventlog'
export const EVENT_LOG_BRANCH: string = 'master'

export function eventLogExists(): boolean {
  return repoExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH);
}

export function createEventLog(content: object) {
  return createNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, content)
}

export function updateEventLog(key: string, newContent: RepoNode): RepoNode {
  return withConnection<RepoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key,
      editor: () => newContent
    })
  })
}
