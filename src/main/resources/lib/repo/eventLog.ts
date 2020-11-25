import { deleteNode, RepoCommonLib } from './common'
import { NodeCreateParams, NodeQueryHit, NodeQueryResponse, RepoNode } from 'enonic-types/node'
import { RepoLib } from './repo'
import { EventInfo, QueryInfo } from './query'
import { I18nLibrary } from 'enonic-types/i18n'
import { ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Table } from '../../site/content-types/table/table'
import { Highchart } from '../../site/content-types/highchart/highchart'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
const i18n: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  nodeExists,
  createNode,
  getNode,
  getChildNodes,
  withConnection,
  queryNodes
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  repoExists,
  createRepo
}: RepoLib = __non_webpack_require__('/lib/repo/repo')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

export const EVENT_LOG_REPO: string = 'no.ssb.eventlog'
export const EVENT_LOG_BRANCH: string = 'master'

export type EditorCallback<T> = (node: T & RepoNode) => T & RepoNode;

export function setupEventLog(): void {
  if (!eventLogExists()) {
    log.info(`Setting up EventLog ...`)
    createEventLog({
      _path: 'queries',
      _name: 'queries'
    })
    createEventLog({
      _path: 'jobs',
      _name: 'jobs'
    })
    log.info(`EventLog Repo for jobs and queries initialized.`)
  }
}

export function eventLogExists(): boolean {
  return repoExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH)
}

export function createEventLogRepo(): void {
  createRepo(EVENT_LOG_REPO, EVENT_LOG_BRANCH)
}

export function createEventLog<T>(content: T & NodeCreateParams, createRepoIfNotFound: boolean = true): T & RepoNode {
  if (!eventLogExists() && createRepoIfNotFound) {
    createEventLogRepo()
  }

  return createNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, content)
}

export function updateEventLog<T>(key: string, editor: EditorCallback<T> ): T & RepoNode {
  return withConnection<T & RepoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key,
      editor
    })
  })
}

export function getQueryChildNodesStatus<T>(queryId: string): ReadonlyArray<LogSummary> | undefined {
  if (nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)) {
    const childNodeIds: NodeQueryResponse<string> = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)
    return childNodeIds.hits.map((hit: NodeQueryHit) => {
      const nodes: ReadonlyArray<QueryInfo> | QueryInfo | null = getNode<QueryInfo>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, hit.id)
      return Array.isArray(nodes) ? nodes[0] : nodes
    }).map( (node: EventInfo) => ({
      result: i18n.localize({
        key: node.data.status.message,
        values: node.data.status.status ? [`(${node.data.status.status})`] : ['']
      }),
      modifiedTs: node.data.ts,
      by: node.data.by && node.data.by.displayName ? node.data.by.displayName : ''
    }))
  } else {
    return undefined
  }
}

export function deleteExpiredEventLogs(): void {
  log.info('Deleting expired event logs')
  const path: string = '/queries'
  const maxLogsBeforeDeleting: number = 10
  const monthsBeforeLogsExpire: number = 1

  const contentsWithLogs: QueryResponse<Table | Highchart | KeyFigure> = query({
    contentTypes: [`${app.name}:table`, `${app.name}:highchart`, `${app.name}:keyfigure`],
    count: 2000,
    query: ``
  })
  const oneMonthAgo: Date = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - monthsBeforeLogsExpire)
  contentsWithLogs.hits
    .filter((content) => nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}`))
    .forEach( (content) => {
      const eventLogs: NodeQueryResponse<string> = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}`, 2000)
      if (eventLogs.total > maxLogsBeforeDeleting) {
        const query: string = `_parentPath = '${path}/${content._id}' AND _ts < dateTime('${oneMonthAgo.toISOString()}')`
        const expiredLogs: NodeQueryResponse<string> = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
          query
        })
        expiredLogs.hits.forEach( (eventLog: NodeQueryHit) => {
          deleteNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}/${eventLog.id}`) ?
            log.info(`Deleted expired event log: ${path}/${content._id}/${eventLog.id}`) :
            log.error(`Failed to delete event log: ${path}/${content._id}/${eventLog.id}`)
        })
      }
    })
}

export interface LogSummary {
  result: string|undefined;
  modifiedTs: string|undefined;
  by: string;
}

export interface EventLogLib {
  EVENT_LOG_REPO: string;
  EVENT_LOG_BRANCH: string;
  setupEventLog: () => void;
  eventLogExists: () => boolean;
  createEventLogRepo: () => void;
  createEventLog: <T>(content: T & NodeCreateParams, createRepoIfNotFound?: boolean) => T & RepoNode;
  updateEventLog: <T>(key: string, editor: EditorCallback<T>) => T & RepoNode;
  getQueryChildNodesStatus: <T>(queryId: string) => ReadonlyArray<LogSummary> | undefined;
  deleteOldLogs: () => void;
}
