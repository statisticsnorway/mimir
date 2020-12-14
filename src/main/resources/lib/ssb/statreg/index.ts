import { StatRegRepoLib } from '../../repo/statreg'
import { Socket, SocketEmitter } from '../../types/socket'
import { StatRegContactsLib } from '../../repo/statreg/contacts'
import { StatRegStatisticsLib } from '../../repo/statreg/statistics'
import { StatRegPublicationsLib } from '../../repo/statreg/publications'
import { StatRegLatestFetchInfoNode } from '../../repo/statreg/eventLog'
import { getNode } from '../../repo/common'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO } from '../../repo/eventLog'
import { Events, QueryInfo } from '../../repo/query'
import { DashboardDatasetLib } from '../dataset/dashboard'

const {
  STATREG_NODES,
  fetchStatRegData,
  toDisplayString
}: StatRegRepoLib = __non_webpack_require__('/lib/repo/statreg')
const {
  STATREG_REPO_CONTACTS_KEY
}: StatRegContactsLib = __non_webpack_require__('/lib/repo/statreg/contacts')
const {
  STATREG_REPO_STATISTICS_KEY
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  STATREG_REPO_PUBLICATIONS_KEY
}: StatRegPublicationsLib = __non_webpack_require__('/lib/repo/statreg/publications')
const {
  showWarningIcon
}: DashboardDatasetLib = __non_webpack_require__('/lib/ssb/dataset/dashboard')

export type StatRegLatestFetchInfoNodeType = StatRegLatestFetchInfoNode | readonly StatRegLatestFetchInfoNode[] | null;
export function getStatRegFetchStatuses(): Array<StatRegStatus> {
  return [
    STATREG_REPO_CONTACTS_KEY,
    STATREG_REPO_STATISTICS_KEY,
    STATREG_REPO_PUBLICATIONS_KEY
  ].map(getStatRegStatus)
}

function getStatRegStatus(key: string): StatRegStatus {
  const logNode: QueryInfo | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${key}`) as QueryInfo
  const statRegData: StatRegStatus = {
    key,
    displayName: toDisplayString(key),
    completionTime: logNode.data.modified,
    message: logNode.data.modifiedResult || '',
    hasError: showWarningIcon(logNode.data.modifiedResult as Events)
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
    statRegKeys.forEach((key) => {
      fetchStatRegData(STATREG_NODES.filter((nodeConfig) => nodeConfig.key === key))
      socketEmitter.broadcast('statreg-dashboard-refresh-result', getStatRegStatus(key))
    })
  })
}

export interface StatRegStatus {
  key: string;
  displayName: string;
  completionTime: string | undefined;
  message: string;
  hasError: boolean;
}

export interface SSBStatRegLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
}
