import { RepoNode } from 'enonic-types/lib/node'
import { EditorCallback, EventLogLib } from './eventLog'
import { AuthLibrary, User } from 'enonic-types/lib/auth'
const {
  modifyNode
} = __non_webpack_require__( '/lib/repo/common')

const {
  EVENT_LOG_REPO,
  EVENT_LOG_BRANCH,
  createEventLog
}: EventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const auth: AuthLibrary = __non_webpack_require__( '/lib/xp/auth')

export enum JobStatus {
  STARTED = 'STARTED',
  COMPLETE = 'COMPLETE',
}

export type JobInfoNode = RepoNode & JobInfo
export type JobEventNode = RepoNode & JobEvent

export interface JobInfo {
  data: {
    status: JobStatus;
    refreshDataResult: object;
    message: string;
    httpStatusCode?: number;
    startTime: string;
    completionTime: string;
  };
}

export interface JobEvent {
  data: {
    task?: string;
    jobStarted: string;
    status: string;
    user: User | null;
  };
}

export function startJobLog(task?: string): JobEventNode {
  const user: User | null = auth.getUser()
  const now: Date = new Date()
  return createEventLog({
    _parentPath: '/jobs',
    data: {
      task: task,
      jobStarted: now.toISOString(),
      status: JobStatus.STARTED,
      user
    }
  })
}

export function updateJobLog<T>(jobId: string, editor: EditorCallback<JobInfoNode>): JobInfoNode {
  return modifyNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, jobId, editor)
}


export function completeJobLog(jobLogId: string, message: string, refreshDataResult: object ): JobInfoNode {
  const now: Date = new Date()
  return updateJobLog<JobInfoNode>(jobLogId, function(node: JobInfoNode): JobInfoNode {
    node.data = {
      ...node.data,
      completionTime: now.toISOString(),
      status: JobStatus.COMPLETE,
      message,
      refreshDataResult
    }
    return node
  })
}

export interface RepoJobLib {
  startJobLog: (task?: string) => object;
  updateJobLog: <T>(jobId: string, editor: EditorCallback<JobInfoNode>) => JobInfoNode;
  completeJobLog: (jobLogId: string, message: string, refreshDataResult: object ) => JobInfoNode;
}
