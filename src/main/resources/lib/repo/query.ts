import { Content } from 'enonic-types/lib/content'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { NodeQueryResponse, RepoNode } from 'enonic-types/lib/node'
import { JobInfoNode } from './job'
import { withConnection } from './common'
import { UtilLibrary } from '../types/util'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO, createEventLog, EditorCallback, updateEventLog } from './eventLog'
const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export type QueryInfoNode = QueryInfo & RepoNode

export enum UpdateResult {
  STARTED = 'started',
  NO_NEW_DATA = 'no new data',
  COMPLETE = 'complete',
  FAILED = 'update failed'
}

export interface QueryInfo {
  data: {
    queryId: string;
    lastUpdated?: string;
    lastUpdateResult?: UpdateResult;
    jobs: Array<string>;
  };
}


export function startQuery(dataQuery: Content<Dataquery>, job: JobInfoNode): QueryInfoNode {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `data.queryId = '${dataQuery._id}'`
    })
    if (queryResult.total === 1) {
      return addJobToQueryNode(queryResult.hits[0].id, job)
    } else {
      return createQueryNode(dataQuery, job)
    }
  })
}

export function createQueryNode(dataquery: Content<Dataquery>, job: JobInfoNode): QueryInfoNode {
  return createEventLog<QueryInfo> ({
    _parentPath: '/queries',
    data: {
      queryId: dataquery._id,
      jobs: [job._id]
    }
  })
}

export function updateQuery<T>(queryId: string, editor: EditorCallback<QueryInfoNode>): QueryInfoNode {
  return updateEventLog(queryId, editor)
}

export function addJobToQueryNode(queryId: string, job: JobInfoNode): QueryInfoNode {
  return updateQuery(queryId, function(node: QueryInfoNode): QueryInfoNode {
    node.data = {
      ...node.data,
      jobs: [
        ...(util.data.forceArray(node.data.jobs)),
        job._id
      ] as Array<string>
    }
    return node
  })
}

export function setQueryLogStatus(queryId: string, status: UpdateResult): QueryInfoNode {
  return updateQuery(queryId, function(node: QueryInfoNode): QueryInfoNode {
    node.data = {
      ...node.data,
      lastUpdateResult: status
    }
    return node
  })
}

export function getQueryLog(queryId: string): object | undefined {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `_parentPath = '/queries' AND data.queryId = '${queryId}'`
    })
    return queryResult.total > 0 ? queryResult.hits[0] : undefined
  })
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
