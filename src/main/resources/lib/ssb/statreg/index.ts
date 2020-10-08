import { RepoCommonLib } from '../../repo/common'
import { StatRegRepoLib } from '../../repo/statreg'
import { Socket, SocketEmitter } from '../../types/socket'
import { StatRegContactsLib } from '../../repo/statreg/contacts'
import { StatRegStatisticsLib } from '../../repo/statreg/statistics'
import { StatRegPublicationsLib } from '../../repo/statreg/publications'
import { StatRegLatestFetchInfoNode } from '../../repo/statreg/eventLog'
import { EventLogLib } from '../../repo/eventLog'

const {
  getNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  STATREG_NODES,
  setupStatRegRepo,
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
  EVENT_LOG_REPO, EVENT_LOG_BRANCH
}: EventLogLib = __non_webpack_require__('/lib/repo/eventLog')

export type StatRegLatestFetchInfoNodeType = StatRegLatestFetchInfoNode | readonly StatRegLatestFetchInfoNode[] | null;
export function getStatRegFetchStatuses(): Array<StatRegStatus> {
  return [
    STATREG_REPO_CONTACTS_KEY,
    STATREG_REPO_STATISTICS_KEY,
    STATREG_REPO_PUBLICATIONS_KEY
  ].map(getStatRegStatus)
}

function getStatRegStatus(key: string): StatRegStatus {
  const eventLogKey: string = `/statreg/${key}`
  const eventLogNodeResult: StatRegLatestFetchInfoNodeType = getNode<StatRegLatestFetchInfoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, eventLogKey)
  const eventLogNode: StatRegLatestFetchInfoNode = eventLogNodeResult && (Array.isArray(eventLogNodeResult) ? eventLogNodeResult[0] : eventLogNodeResult)

  const statRegData: StatRegStatus = {
    key,
    displayName: toDisplayString(key),
    completionTime: undefined,
    message: '',
    startTime: undefined,
    status: undefined
  }

  if (eventLogNode && eventLogNode.data.latestEventInfo) {
    statRegData.completionTime = eventLogNode.data.latestEventInfo.completionTime
    statRegData.message = eventLogNode.data.latestEventInfo.message || ''
    statRegData.startTime = eventLogNode.data.latestEventInfo.startTime
    statRegData.status = eventLogNode.data.latestEventInfo.status
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
      setupStatRegRepo(STATREG_NODES.filter((nodeConfig) => nodeConfig.key === key))
      socketEmitter.broadcast('statreg-dashboard-refresh-result', getStatRegStatus(key))
    })
  })
}

export interface StatRegStatus {
  key: string;
  displayName: string;
  completionTime: string | undefined;
  message: string;
  startTime: string | undefined;
  status: string | undefined;
}

export interface SSBStatRegLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
}
