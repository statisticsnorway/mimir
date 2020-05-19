import { RepoNode } from 'enonic-types/lib/node'
import { getNode, withConnection } from './common'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO, createEventLog, EditorCallback, updateEventLog } from './eventLog'
import { AuthLibrary, User } from 'enonic-types/lib/auth'
import { HttpRequestParams, HttpResponse } from 'enonic-types/lib/http'
import { TbmlData } from '../types/xmlParser'
const {
  dateToFormat
} = __non_webpack_require__('/lib/ssb/utils')
const auth: AuthLibrary = __non_webpack_require__( '/lib/xp/auth')
export type QueryInfoNode = QueryInfo & RepoNode

export interface QueryInfo {
  _name: string;
  data: {
    queryId: string;
    modified?: string;
    modifiedTs?: string;
    modifiedResult?: string;
    by: User;
  };
}

export interface QueryStatus {
  message: string;
  response?: HttpResponse;
  request?: HttpRequestParams;
  xmlResult?: TbmlData;
}

export interface EventInfo {
  data: {
    ts: string;
    status: QueryStatus;
    by: User;
  };
}

export enum Events {
  GET_DATA_STARTED = 'GET_DATA_STARTED',
  NO_NEW_DATA = 'NO_NEW_DATA',
  FOUND_DATAQUERY = 'FOUND_DATAQUERY ',
  GET_DATA_COMPLETE = 'GET_DATA_COMPLETE',
  REQUESTING_DATA = 'REQUESTING_DATA',
  START_DELETE = 'START_DELETE',
  DATASET_PUBLISHED = 'DATASET_PUBLISHED',
  DATASET_UPDATED = 'DATASET_UPDATED',
  DELETE_FAILED = 'DELETE_FAILED',
  DELETE_OK = 'DELETE_OK',
  DELETE_OK_PUBLISHED = 'DELETE_OK_PUBLISHED',
  DELETE_FAILED_PUBLISHED = 'DELETE_FAILED_PUBLISHED',
  FAILED_TO_GET_DATA = 'FAILED_TO_GET_DATA',
  FAILED_TO_FIND_DATAQUERY = 'FAILED_TO_FIND_DATAQUERY',
  FAILED_TO_CREATE_DATASET = 'FAILED_TO_CREATE_DATASET',
  FAILED_TO_REFRESH_DATASET = 'FAILED_TO_REFRESH_DATASET',
  XML_TO_JSON = 'XML_TO_JSON'
}

export function logDataQueryEvent(queryId: string, status: QueryStatus): QueryInfoNode | undefined {
  const user: User | null = auth.getUser()
  if (!user) {
    return undefined
  }
  startQuery(queryId, user, status)
  addEventToQueryLog(queryId, user, status)
  return updateQueryLogStatus(queryId, user, status)
}

function addEventToQueryLog(queryId: string, user: User, status: QueryStatus): EventInfo & RepoNode {
  const ts: Date = new Date()
  return createEventLog<EventInfo>({
    _parentPath: `/queries/${queryId}`,
    data: {
      status,
      ts: dateToFormat(ts.toISOString()),
      by: user
    }
  })
}

export function startQuery(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryLogNode: ReadonlyArray<QueryInfoNode> = getNode<QueryInfo>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${queryId}`)
    if (queryLogNode !== null) {
      return queryLogNode[0]
    } else {
      return createQueryNode(queryId, user, status)
    }
  })
}

export function createQueryNode(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
  const ts: Date = new Date()
  return createEventLog<QueryInfo>({
    _parentPath: '/queries',
    _name: queryId,
    data: {
      queryId: queryId,
      modified: dateToFormat(ts.toISOString()),
      modifiedResult: status.message,
      by: user
    }
  })
}

export function updateQuery<T>(key: string, editor: EditorCallback<QueryInfoNode>): QueryInfoNode {
  return updateEventLog(key, editor)
}

export function updateQueryLogStatus(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
  const ts: Date = new Date()

  return updateQuery(`/queries/${queryId}`, function(node: QueryInfoNode): QueryInfoNode {
    node.data = {
      ...node.data,
      by: user,
      modifiedTs: ts.toISOString(),
      modified: dateToFormat(ts.toISOString()),
      modifiedResult: status.message
    }
    return node
  })
}
