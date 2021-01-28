import { RepoNode } from 'enonic-types/node'
import { RepoCommonLib } from './common'
import { EditorCallback, RepoEventLogLib } from './eventLog'
import { User } from 'enonic-types/auth'
import { HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { TbmlDataUniform } from '../types/xmlParser'
const {
  dateToFormat
} = __non_webpack_require__('/lib/ssb/utils')
const {
  getNode,
  withConnection,
  withLoggedInUserContext,
  withSuperUserContext
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO,
  createEventLog,
  updateEventLog
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')
export type QueryInfoNode = QueryInfo & RepoNode

export interface QueryInfo {
  _name: string;
  data: {
    queryId: string;
    modified: string;
    modifiedTs?: string;
    modifiedResult: string;
    by: User;
  };
}

export interface QueryStatus {
  message: string;
  response?: HttpResponse;
  request?: HttpRequestParams;
  xmlResult?: TbmlDataUniform;
  info?: string;
  function?: string;
  file?: string;
  status?: string;
  result?: object;
  branch?: string;
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
  GET_DATA_COMPLETE = 'GET_DATA_COMPLETE',
  NO_NEW_DATA = 'NO_NEW_DATA',
  REQUEST_DATA = 'REQUEST_DATA',
  REQUEST_COULD_NOT_CONNECT = 'REQUEST_COULD_NOT_CONNECT',
  REQUEST_GOT_ERROR_RESPONSE = 'REQUEST_GOT_ERROR_RESPONSE',
  DATASET_PUBLISHED = 'DATASET_PUBLISHED',
  DATASET_UPDATED = 'DATASET_UPDATED',
  DATASOURCE_MISSING = 'DATASOURCE_MISSING',
  FAILED_TO_GET_DATA = 'FAILED_TO_GET_DATA',
  FAILED_TO_FIND_DATAQUERY = 'FAILED_TO_FIND_DATAQUERY',
  FAILED_TO_CREATE_DATASET = 'FAILED_TO_CREATE_DATASET',
  FAILED_TO_REFRESH_DATASET = 'FAILED_TO_REFRESH_DATASET',
  XML_TO_JSON = 'XML_TO_JSON'
}

function logDataQueryEvent(queryId: string, status: QueryStatus, user: User): EventInfo & RepoNode {
  return withSuperUserContext<EventInfo & RepoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, () => {
    startQuery(queryId, user, status)
    const eventLog: EventInfo & RepoNode = addEventToQueryLog(queryId, user, status)
    updateQueryLogStatus(queryId, user, status)
    return eventLog
  })
}

export function logUserDataQuery(queryId: string, status: QueryStatus): EventInfo & RepoNode {
  return withLoggedInUserContext(EVENT_LOG_BRANCH, (user: User) => {
    return logDataQueryEvent(queryId, status, user)
  })
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

function startQuery(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, () => {
    const queryLogNode: ReadonlyArray<QueryInfoNode> | QueryInfoNode | null = getNode<QueryInfo>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${queryId}`)
    if (queryLogNode !== undefined && queryLogNode !== null) {
      return Array.isArray(queryLogNode) ? queryLogNode[0] : queryLogNode
    } else {
      return createQueryNode(queryId, user, status)
    }
  })
}

function createQueryNode(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
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

function updateQuery<T>(key: string, editor: EditorCallback<QueryInfoNode>): QueryInfoNode {
  return updateEventLog(key, editor)
}

function updateQueryLogStatus(queryId: string, user: User, status: QueryStatus): QueryInfoNode {
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

export interface RepoQueryLib {
  logUserDataQuery: (queryId: string, status: QueryStatus) => EventInfo & RepoNode;
  Events: typeof Events;
}
