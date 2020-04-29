import {RepoConnection, RepoNode} from 'enonic-types/lib/node';
import {LogNodeResponse} from './node';
import { createEventLog, updateEventLog } from './eventLog';
import {HttpRequestParams, HttpResponse} from 'enonic-types/lib/http';
import {User} from 'enonic-types/lib/auth';

const {createConnectionInContext, createNodeInContext} = __non_webpack_require__('/lib/repo/node');

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

export function createJob(dataqueries: Array<string>, user?: User): object {
  const now: Date = new Date()
  const jobObject: object = {
    _parentPath: '/jobs',
    data: {
      queryIds: dataqueries,
      jobStarted: now.toISOString(),
      status: 'Started',
      user
    }
  }
  return createNodeInContext(jobObject)
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

export function addRequestDataToJobLog(jobLogId: string, requestParams: HttpRequestParams): object{
  const connection: RepoConnection = createConnectionInContext()
  return connection.modify({
    key: jobLogId,
    editor: function(node: LogJobNode) {
      node.data.status = 'Requesting'
      node.data.request = requestParams
      return node
    }
  })
}


export function addResponseDataToJobLog(jobLogId: string, response: HttpResponse): object {
  const connection: RepoConnection = createConnectionInContext()
  return connection.modify({
    key: jobLogId,
    editor: function(node: LogJobNode) {
      node.data.status = 'Recieved response'
      node.data.httpResponse = response
      return node
    }
  })
}

export function finishJobWithResult(jobLogId: string, success: boolean, message: string, status: number): LogJobNode {
  const connection: RepoConnection = createConnectionInContext()
  const now: Date = new Date()
  return connection.modify({
    key: jobLogId,
    editor: function(node: LogJobNode) {
      node.data.jobEnded = now.toISOString()
      node.data.status = 'Finished'
      node.data.response = {
        success,
        message,
        status
      }
      return node
    }
  })
}


export interface LogJobNode extends RepoNode{
  data: {
    jobStarted: string;
    jobEnded: string;
    status: string;
    request: HttpRequestParams;
    httpResponse: HttpResponse;
    response: LogNodeResponse;
  };
}
