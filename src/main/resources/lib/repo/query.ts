import { Content } from 'enonic-types/lib/content'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { NodeQueryHit, NodeQueryResponse, RepoConnection, RepoNode } from 'enonic-types/lib/node'
import { UtilLibrary } from '../types/util'
import { LogJobNode } from './job';

const { createConnectionInContext, createNodeInContext } = __non_webpack_require__('./node')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export function createLogQuery(dataquery: Content<Dataquery>, job: LogJobNode): object {
  return createNodeInContext({
    _parentPath: '/queries',
    queryId: dataquery._id,
    jobs: [{
      id: job._id,
      response: job.response
    }]
  })
}

export function updateLogQueryWithJob(dataqueryId: string, job: LogJobNode): LogQueryNode {
  const connection: RepoConnection = createConnectionInContext()
  return connection.modify({
    key: dataqueryId,
    editor: function(node: LogQueryNode) {
      node.jobs = util.data.forceArray(node.jobs) as Array<LogJobSummaryNode>
      node.jobs.push({
        id: job._id,
        response: job.response
      })
      return node
    }
  })
}

export function addJobToQuery(dataquery: Content<Dataquery>, job: LogJobNode): void {
  const connection: RepoConnection = createConnectionInContext()
  const queryResult: NodeQueryResponse = connection.query({
    count: 1,
    query: `queryId = '${dataquery._id}'`
  })
  if (queryResult.total === 1) {
    const queryLog: NodeQueryHit = queryResult.hits[0]
    const logQuery: LogQueryNode = updateLogQueryWithJob(queryLog.id, job)
  } else {
    const logQuery: object = createLogQuery(dataquery, job)
  }
}

export interface LogQueryNode extends RepoNode {
  queryId: string;
  jobs: Array<LogJobSummaryNode>;
}

export interface LogJobSummaryNode {
  id: string;
  response: object;
}
