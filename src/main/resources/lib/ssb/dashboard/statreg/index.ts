import { StatRegRefreshResult, StatRegNode } from '../../repo/statreg'
import { Socket, SocketEmitter } from '../../../types/socket'
import { StatRegLatestFetchInfoNode } from '../../statreg/eventLog'
import { LogSummary } from '../../repo/eventLog'
import { Events, QueryInfo } from '../../repo/query'
import { run, RunContext } from '/lib/xp/context'
import { DashboardRefreshResultLogData } from '../dashboard'
import { ContextAttributes } from '*/lib/xp/context'

const { STATREG_NODES, refreshStatRegData, getStatRegNode } = __non_webpack_require__('/lib/ssb/repo/statreg')
const { STATREG_REPO_CONTACTS_KEY } = __non_webpack_require__('/lib/ssb/statreg/contacts')
const { STATREG_REPO_STATISTICS_KEY } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { STATREG_REPO_PUBLICATIONS_KEY } = __non_webpack_require__('/lib/ssb/statreg/publications')
const { showWarningIcon, users } = __non_webpack_require__('/lib/ssb/dashboard/dashboardUtils')
const { dateToReadable, dateToFormat } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getNode, ENONIC_CMS_DEFAULT_REPO } = __non_webpack_require__('/lib/ssb/repo/common')
const { EVENT_LOG_BRANCH, EVENT_LOG_REPO, getQueryChildNodesStatus } = __non_webpack_require__('/lib/ssb/repo/eventLog')
const { localize } = __non_webpack_require__('/lib/xp/i18n')

export type StatRegLatestFetchInfoNodeType = StatRegLatestFetchInfoNode | readonly StatRegLatestFetchInfoNode[] | null
export function getStatRegFetchStatuses(): Array<StatRegStatus> {
  return [STATREG_REPO_CONTACTS_KEY, STATREG_REPO_STATISTICS_KEY, STATREG_REPO_PUBLICATIONS_KEY].map(getStatRegStatus)
}

function toDisplayString(key: string): string {
  switch (key) {
    case STATREG_REPO_CONTACTS_KEY:
      return 'kontakter'
    case STATREG_REPO_STATISTICS_KEY:
      return 'statistikk'
    case STATREG_REPO_PUBLICATIONS_KEY:
      return 'publiseringer'
    default:
      return key
  }
}

function getStatRegStatus(key: string): StatRegStatus {
  const logNode: QueryInfo | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${key}`) as QueryInfo | null
  const statRegNode: StatRegNode | null = getStatRegNode(key)
  const modifiedResult: string = (logNode && logNode.data.modifiedResult) || ''
  const logMessage: string = localize({
    key: modifiedResult || '',
    values: [modifiedResult || ''],
  })
  const statRegData: StatRegStatus = {
    key,
    displayName: toDisplayString(key),
    modified: statRegNode ? dateToFormat(statRegNode._ts) : undefined,
    modifiedReadable: statRegNode ? dateToReadable(statRegNode._ts) : undefined,
    logData: logNode
      ? {
          ...logNode.data,
          modified: logNode.data.modified,
          modifiedReadable: dateToReadable(logNode.data.modifiedTs),
          showWarningIcon: showWarningIcon(modifiedResult as Events),
          message: logMessage,
        }
      : {},
    eventLogNodes: [],
  }
  return statRegData
}

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('statreg-dashboard-status', () => {
    socket.emit('statreg-dashboard-status-result', getStatRegFetchStatuses())
  })

  socket.on('statreg-dashboard-refresh', (statRegKeys: Array<string>) => {
    // tell all clients that the refresh starts
    statRegKeys.forEach((key) => {
      socketEmitter.broadcast('statreg-dashboard-refresh-start', key)
    })
    // start refreshing
    const context: RunContext<ContextAttributes> = {
      branch: 'master',
      repository: ENONIC_CMS_DEFAULT_REPO,
      principals: ['role:system.admin'],
      user: {
        login: users[parseInt(socket.id)].login,
        idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system',
      },
    }
    run(context, () => {
      runRefresh(socketEmitter, statRegKeys)
    })
  })

  socket.on('get-statreg-eventlog-node', (key) => {
    let status: Array<LogSummary> | undefined = getQueryChildNodesStatus(`/queries/${key}`) as
      | Array<LogSummary>
      | undefined
    if (!status) {
      status = []
    }
    socket.emit('statreg-eventlog-node-result', {
      logs: status,
      id: key,
    })
  })
}

function runRefresh(socketEmitter: SocketEmitter, statRegKeys: Array<string>): void {
  statRegKeys.forEach((key) => {
    refreshStatRegData(STATREG_NODES.filter((nodeConfig) => nodeConfig.key === key))
    socketEmitter.broadcast('statreg-dashboard-refresh-result', getStatRegStatus(key))
  })
}

export function parseStatRegJobInfo(refreshDataResult: Array<StatRegRefreshResult>): Array<StatRegJobInfo> {
  return refreshDataResult.map((result) => {
    const displayName: string = toDisplayString(result.key)
    const status: string = localize({
      key: result.status,
      values: [result.status],
    })
    let infoMessage = ''
    if (result.status === Events.DATASET_UPDATED || result.status === Events.NO_NEW_DATA) {
      const { added, changed, deleted, total } = result.info
      if (added || changed || deleted) {
        infoMessage = ''
        if (added) {
          infoMessage += `lagt til: ${added}`
        }
        if (changed) {
          if (infoMessage.length > 1) {
            infoMessage += ', '
          }
          infoMessage += `endret: ${changed}`
        }
        if (deleted) {
          if (infoMessage.length > 1) {
            infoMessage += ', '
          }
          infoMessage += `slettet: ${deleted}`
        }
        infoMessage += `, totalt: ${total}`
      } else {
        infoMessage = `totalt: ${total}`
      }
    }
    return {
      displayName,
      status,
      showWarningIcon: showWarningIcon(result.status as Events),
      hasNewData: result.status === Events.DATASET_UPDATED,
      infoMessage,
    }
  })
}

export interface StatRegStatus {
  key: string
  displayName: string
  modified: string | undefined
  modifiedReadable: string | undefined
  logData: DashboardRefreshResultLogData | {}
  eventLogNodes: Array<LogSummary>
}

export interface StatRegJobInfo {
  displayName: string
  status: string
  showWarningIcon: boolean
  hasNewData: boolean
  infoMessage: string
}

export interface SSBStatRegLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void
  parseStatRegJobInfo: (refreshDataResult: Array<StatRegRefreshResult>) => Array<StatRegJobInfo>
}
