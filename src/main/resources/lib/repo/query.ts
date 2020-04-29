import { Content } from 'enonic-types/lib/content'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { NodeQueryHit, NodeQueryResponse, RepoConnection, RepoNode } from 'enonic-types/lib/node'
import { JobInfo, LogJobNode } from './job'
import { withConnection } from './common'
import { UtilLibrary } from '../types/util'
import { getNodeInContext } from './node'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO, createEventLog } from './eventLog'

const { createConnectionInContext, createNodeInContext } = __non_webpack_require__('./node')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')


export interface QueryInfo extends RepoNode {
  queryId: string;
  jobs: Array<JobInfo>;
}

export function createQueryNode(dataquery: Content<Dataquery>, job: JobInfo): object {
  return createEventLog({
    _parentPath: '/queries',
    queryId: dataquery._id,
    jobs: [{
      id: job._id,
      ...job
    }]
  })
}

export function createLogQuery(dataquery: Content<Dataquery>, job: LogJobNode): object {
  return createNodeInContext({
    _parentPath: '/queries',
    data: {
      queryId: dataquery._id,
      jobs: [{
        id: job._id,
        response: job.data.response
      }]
    }
  })
}


export function updateQuery(dataqueryId: string, job: JobInfo): QueryInfo {
  return withConnection<QueryInfo>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key: dataqueryId,
      editor: (node: QueryInfo) => {
        return {
          ...node,
          jobs: [
            ...(util.data.forceArray(node.jobs) as Array<JobInfo>),
            job
          ]
        }
      }
    })
  })
}

export function updateLogQueryWithJob(dataqueryId: string, job: LogJobNode): LogQueryNode {
  const connection: RepoConnection = createConnectionInContext()
  return connection.modify({
    key: dataqueryId,
    editor: function(node: LogQueryNode) {
      node.data.jobs = util.data.forceArray(node.data.jobs) as Array<LogJobSummaryNode>
      node.data.jobs.push({
        id: job._id,
        response: job.data.response
      })
      return node
    }
  })
}


export function startQuery(dataQuery: Content<Dataquery>, job: JobInfo): void {
  withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `queryId = '${dataQuery._id}`
    })
    if (queryResult.total === 1) {
      updateQuery(queryResult.hits[0].id, job)
    } else {
      createQueryNode(dataQuery, job)
    }
  })
}

export function addJobToQuery(dataquery: Content<Dataquery>, job: LogJobNode): void {
  const connection: RepoConnection = createConnectionInContext()
  const queryResult: NodeQueryResponse = connection.query({
    count: 1,
    query: `data.queryId = '${dataquery._id}'`
  })
  if (queryResult.total === 1) {
    const queryLog: NodeQueryHit = queryResult.hits[0]
    const logQuery: LogQueryNode = updateLogQueryWithJob(queryLog.id, job)
  } else {
    const logQuery: object = createLogQuery(dataquery, job)
  }
}

export function getQueryLog(queryId: string): object | undefined {
  const connection: RepoConnection = createConnectionInContext()
  const queryResult: NodeQueryResponse = connection.query({
    count: 1,
    query: `_parentPath = '/queries' AND data.queryId = '${queryId}'`
  })
  const query: NodeQueryHit | undefined = queryResult.total > 0 ? queryResult.hits[0] : undefined
  if (query) {
    return getNodeInContext(query.id)
  } else {
    return undefined
  }
}

export interface LogQueryNode extends RepoNode {
  data: {
    queryId: string;
    jobs: Array<LogJobSummaryNode>;
  };
}

export interface LogJobSummaryNode {
  id: string;
  response: object;
}
