import { CreateNodeParams, Node } from '/lib/xp/node'
import { EventInfo, QueryInfo } from '/lib/ssb/repo/query'

const { localize } = __non_webpack_require__('/lib/xp/i18n')
const { nodeExists, createNode, getNode, getChildNodes, withConnection } =
  __non_webpack_require__('/lib/ssb/repo/common')
const { repoExists, createRepo } = __non_webpack_require__('/lib/ssb/repo/repo')

export const EVENT_LOG_REPO = 'no.ssb.eventlog'
export const EVENT_LOG_BRANCH = 'master'

export type EditorCallback<T> = (node: T & Node) => T & Node

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

export function createEventLog<T>(content: T & CreateNodeParams, createRepoIfNotFound = true): T & Node {
  if (!eventLogExists() && createRepoIfNotFound) {
    createEventLogRepo()
  }

  return createNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, content)
}

export function updateEventLog<T>(key: string, editor: EditorCallback<T>): T & Node {
  return withConnection<T & Node>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key,
      editor,
    })
  })
}

export function getQueryChildNodesStatus(queryId: string): ReadonlyArray<LogSummary> | undefined {
  if (nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)) {
    const childNodeIds = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, queryId)
    return childNodeIds.hits
      .map((hit) => {
        const nodes = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, hit.id) as ReadonlyArray<QueryInfo> | QueryInfo | null
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
  createEventLog: <T>(content: T & CreateNodeParams, createRepoIfNotFound?: boolean) => T & Node
  updateEventLog: <T>(key: string, editor: EditorCallback<T>) => T & Node
  getQueryChildNodesStatus: (queryId: string) => ReadonlyArray<LogSummary> | undefined
}
