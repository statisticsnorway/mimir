import { RepoNode} from 'enonic-types/lib/node';
import {createEventLog, EditorCallback, updateEventLog} from './eventLog';
import {User} from 'enonic-types/lib/auth';

enum JobStatus {
  STARTED = 'Started',
  COMPLETE = 'Completed',
}

export type JobInfoNode = RepoNode & JobInfo

export interface JobInfo {
  data: {
    status: JobStatus;
    success: boolean;
    message: string;
    httpStatusCode?: number;
    startTime: string;
    completionTime: string;
  };
}

export function createJobNode(queryIds: Array<string>, user?: User, task?: string): object {
  const now: Date = new Date()
  return createEventLog({
    _parentPath: '/jobs',
    data: {
      queryIds,
      task: task,
      jobStarted: now.toISOString(),
      status: JobStatus.STARTED,
      user
    }
  })
}

export function updateJob<T>(jobId: string, editor: EditorCallback<JobInfoNode>): JobInfoNode {
  return updateEventLog(jobId, editor)
}


export function completeJob(jobLogId: string, success: boolean, message: string ): JobInfoNode {
  const now: Date = new Date();
  return updateJob<JobInfoNode>(jobLogId, function(node: JobInfoNode): JobInfoNode {
    node.data = {
      ...node.data,
      completionTime: now.toISOString(),
      status: JobStatus.COMPLETE,
      success,
      message
    }
    return node
  })
}
