import { HttpRequestParams, HttpResponse } from 'enonic-types/lib/http'
import { createEventLog } from './eventLog'
import { RepoNode } from 'enonic-types/lib/node'

export type RequestLogNode = RequestLog & RepoNode

export interface RequestLog {
  data: {
    requestedBy: string;
    queryId: string;
    request: HttpRequestParams;
    response: HttpResponse;
  };
}

export function createRequestLog(jobLogId: string, queryId: string, request: HttpRequestParams, response: HttpResponse): RequestLogNode {
  return createEventLog({
    _parentPath: `/jobs/${jobLogId}`,
    data: {
      requestedBy: jobLogId,
      queryId,
      request,
      response
    }
  })
}

