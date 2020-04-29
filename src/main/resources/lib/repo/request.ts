import { createNodeInContext } from './node'
import {HttpRequestParams, HttpResponse} from 'enonic-types/lib/http';
import {RepoNode} from 'enonic-types/lib/node';

export function createRequestLog(jobLogId: string, queryId: string, request: HttpRequestParams, response: HttpResponse): object {
  return createNodeInContext({
    _parentPath: `/jobs/${jobLogId}`,
    data: {
      requestedBy: jobLogId,
      queryId: queryId,
      request,
      response
    }
  })
}

export interface RequestLog extends RepoNode{
  data: {
    requestedBy: string;
    queryId: string;
    request: HttpRequestParams;
    response: HttpResponse;
  };
}
