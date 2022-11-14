import { NodeCreateParams, NodeQueryHit, NodeQueryResponse, RepoNode } from '/lib/xp/node'
import { EventInfo, QueryInfo } from './query'

const { localize } = __non_webpack_require__('/lib/xp/i18n')
const { nodeExists, createNode, getNode, getChildNodes, withConnection } =
  __non_webpack_require__('/lib/ssb/repo/common')
const { repoExists, createRepo } = __non_webpack_require__('/lib/ssb/repo/repo')

export const EVENT_LOG_REPO = 'no.ssb.eventlog'
export const EVENT_LOG_BRANCH = 'master'

export type EditorCallback<T> = (node: T & RepoNode) => T & RepoNode

export function setupEventLog(): void {
  if (!eventLogExists()) {
    log.info(`Setting up EventLog ...`)
    createEventLog({
      _path: 'queries',
      _name: 'queries',
    })
    createEventLog({
      _path: 'jobs',
      _name: 'jobs',
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

export function createEventLog<T>(content: T & NodeCreateParams, createRepoIfNotFound = true): T & RepoNode {
  if (!eventLogExists() && createRepoIfNotFound) {
    createEventLogRepo()
  }

  return createNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, content)
}

export function updateEventLog<T>(key: string, editor: EditorCallback<T>): T & RepoNode {
  return withConnection<T & RepoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key,
      editor,
    })
  })
}

export function getQueryChildNodesStatus<T>(queryId: string): ReadonlyArray<LogSummary> | undefined {
  if (nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)) {
    const childNodeIds: NodeQueryResponse = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)
    return childNodeIds.hits
      .map((hit: NodeQueryHit) => {
        const nodes: ReadonlyArray<QueryInfo> | QueryInfo | null = getNode<QueryInfo>(
          EVENT_LOG_REPO,
          EVENT_LOG_BRANCH,
          hit.id
        )
        return Array.isArray(nodes) ? nodes[0] : nodes
      })
      .map((node: EventInfo) => {
        const resultMessage: string = localize({
          key: node.data.status.message,
          values: node.data.status.status ? [`(${node.data.status.status})`] : [''],
        })
        return {
          result: resultMessage !== 'NOT_TRANSLATED' ? resultMessage : node.data.status.message,
          modifiedTs: node.data.ts,
          by: node.data.by && node.data.by.displayName ? node.data.by.displayName : '',
        }
      })
  } else {
    return undefined
  }
}

export interface LogSummary {
  result: string | undefined
  modifiedTs: string | undefined
  by: string
}

export interface RepoEventLogLib {
  EVENT_LOG_REPO: string
  EVENT_LOG_BRANCH: string
  setupEventLog: () => void
  eventLogExists: () => boolean
  createEventLogRepo: () => void
  createEventLog: <T>(content: T & NodeCreateParams, createRepoIfNotFound?: boolean) => T & RepoNode
  updateEventLog: <T>(key: string, editor: EditorCallback<T>) => T & RepoNode
  getQueryChildNodesStatus: <T>(queryId: string) => ReadonlyArray<LogSummary> | undefined
}
