import { RepoNode } from 'enonic-types/lib/node';
import { createEventLog, updateEventLog } from './eventLog';

enum JobStatus {
  STARTED = 'Started',
  COMPLETE = 'Completed',
}

export interface JobInfo extends RepoNode {
  status: JobStatus;
  success: boolean;
  message: string;
  httpStatusCode: number;
}

export function createJobNode(queryIds: Array<string>) {
  return createEventLog({
    _parentPath: '/jobs',
    queryIds,
    status: JobStatus.STARTED,
    user: '...'
  })
}

export function updateJob(jobId: string, jobInfo: JobInfo): JobInfo {
  return updateEventLog(jobId, jobInfo) as JobInfo
}

