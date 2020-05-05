import { Content } from 'enonic-types/lib/content'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { NodeQueryResponse, RepoNode } from 'enonic-types/lib/node'
import { JobInfoNode } from './job'
import { getNode, withConnection } from './common'
import { UtilLibrary } from '../types/util'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO, createEventLog, EditorCallback, updateEventLog } from './eventLog'
import { I18nLibrary } from 'enonic-types/lib/i18n'

const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export interface QueryInfo {
  data: {
    queryId: string;
    lastUpdated?: string;
    lastUpdateResult?: string;
    lastUpdateResultCode?: number;
    jobs: Array<string>;
  };
}

export type QueryInfoNode = QueryInfo & RepoNode
export enum UpdateResult {
  STARTED = 'STARTED',
  NO_NEW_DATA = 'NO_NEW_DATA',
  COMPLETE = 'COMPLETE',
  FAILED_TO_GET_DATA = 'FAILED_TO_GET_DATA',
  FAILED_TO_FIND_DATAQUERY = 'FAILED_TO_FIND_DATAQUERY',
}

export function startQuery(dataQuery: Content<Dataquery>, job: JobInfoNode, now?: Date): QueryInfoNode {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `data.queryId = '${dataQuery._id}'`
    })
    if (queryResult.total === 1) {
      return addJobToQueryNode(queryResult.hits[0].id, job, now)
    } else {
      return createQueryNode(dataQuery, job, now)
    }
  })
}

export function createQueryNode(dataquery: Content<Dataquery>, job: JobInfoNode, now?: Date): QueryInfoNode {
  return createEventLog<QueryInfo>({
    _parentPath: '/queries',
    data: {
      queryId: dataquery._id,
      jobs: [job._id],
      lastUpdated: now? now.toISOString() : undefined
    }
  })
}

export function updateQuery<T>(queryId: string, editor: EditorCallback<QueryInfoNode>): QueryInfoNode {
  return updateEventLog(queryId, editor)
}

export function addJobToQueryNode(queryId: string, job: JobInfoNode, now?: Date): QueryInfoNode {
  return updateQuery(queryId, function(node: QueryInfoNode): QueryInfoNode {
    node.data = {
      ...node.data,
      lastUpdated: now? now.toISOString() : undefined,
      jobs: [
        ...(util.data.forceArray(node.data.jobs)),
        job._id
      ] as Array<string>
    }
    return node
  })
}

export function setQueryLogStatus(queryId: string, status: UpdateResult, now?: Date): QueryInfoNode {
  return updateQuery(queryId, function(node: QueryInfoNode): QueryInfoNode {
    const lastUpdate: Date = now? now : new Date()
    node.data = {
      ...node.data,
      lastUpdated: lastUpdate.toISOString(),
      lastUpdateResult: status
    }
    return node
  })
}

export function getQueryLogWithQueryId(queryId: string): ReadonlyArray<QueryInfoNode> | undefined {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `_parentPath = '/queries' AND data.queryId = '${queryId}'`
    })
    return queryResult.total > 0 ? getNode(queryResult.hits[0].id) : undefined
  })
}

export function getQueryInfo(queryId: string) {
  const queryLogArray: ReadonlyArray<QueryInfoNode> | undefined = getQueryLogWithQueryId(queryId)
  if (queryLogArray) {
    return {

    }
  } else {
    return {}
  }
}
