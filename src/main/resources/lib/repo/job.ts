import {RepoConnection, RepoNode} from 'enonic-types/lib/node';
import {LogNodeResponse} from './node';

const {createConnectionInContext, createNodeInContext} = __non_webpack_require__('/lib/repo/node');

export function createJob(dataqueries: Array<string>): object {
  const jobObject: object = {
    _parentPath: '/jobs',
    queryIds: dataqueries,
    status: 'started',
    user: '...'
  }
  return createNodeInContext(jobObject)
}

export function finishJobWithResult(jobId: string, success: boolean, message: string, status: number): LogJobNode {
  const connection: RepoConnection = createConnectionInContext()
  return connection.modify({
    key: jobId,
    editor: function(node: LogJobNode) {
      node.status = 'finished'
      node.response = {
        success,
        message,
        status
      }
      return node
    }
  })
}


export interface LogJobNode extends RepoNode{
  status: string;
  response: LogNodeResponse;
}
