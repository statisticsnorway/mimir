import { createNode, withConnection } from './common';
import { JobInfo } from './job';
import { RepoNode } from 'enonic-types/lib/node';
import { repoExists } from './repo';

export const LOG_REPO_ID: string = 'no.ssb.datarequestlog'
export const LOG_BRANCH_NAME: string = 'master'

export function eventLogExists(): boolean {
  return repoExists(LOG_REPO_ID, LOG_BRANCH_NAME);
}

export function createEventLog(content: object) {
  return createNode(LOG_REPO_ID, LOG_BRANCH_NAME, {
    repoId: LOG_REPO_ID,
    branch: LOG_BRANCH_NAME,
  })
}

export function updateEventLog(key: string, newContent: RepoNode): RepoNode {
  return withConnection<RepoNode>(LOG_REPO_ID, LOG_BRANCH_NAME, (conn) => {
    return conn.modify({
      key,
      editor: () => newContent
    })
  })
}
