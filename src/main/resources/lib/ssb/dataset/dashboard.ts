
import { DatasetLib, CreateOrUpdateStatus } from './dataset'
import { ContentLibrary, Content } from 'enonic-types/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { Events } from '../../repo/query'
import { EVENT_LOG_REPO, EVENT_LOG_BRANCH, LogSummary, EventLogLib } from '../../repo/eventLog'
import { RepoNode } from 'enonic-types/node'
import { I18nLibrary } from 'enonic-types/i18n'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { Socket, SocketEmitter } from '../../types/socket'
import { SSBCacheLibrary } from '../cache'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { TbmlData } from '../../types/xmlParser'
import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { RepoCommonLib } from '../../repo/common'

const {
  logUserDataQuery
} = __non_webpack_require__( '/lib/repo/query')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__( '/lib/repo/common')
const {
  refreshDataset,
  getContentWithDataSource,
  extractKey,
  getDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  get: getContent
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  dateToFormat,
  dateToReadable,
  isPublished
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  getParentType
} = __non_webpack_require__('/lib/ssb/parent')
const i18n: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  fromDatasetRepoCache
}: SSBCacheLibrary = __non_webpack_require__('/lib/ssb/cache')
const {
  getQueryChildNodesStatus
}: EventLogLib = __non_webpack_require__('/lib/repo/eventLog')

export const users: Array<RegisterUserOptions> = []

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-dataqueries', () => {
    const contentWithDataSource: Array<unknown> = prepDataSources(getContentWithDataSource())
    socket.emit('dataqueries-result', contentWithDataSource)
  })

  socket.on('get-eventlog-node', (dataQueryId)=> {
    let status: Array<LogSummary> | undefined = getQueryChildNodesStatus(`/queries/${dataQueryId}`) as Array<LogSummary> | undefined
    if (!status) {
      status = []
    }
    socket.emit('eventlog-node-result', {
      logs: status,
      id: dataQueryId
    })
  })

  socket.on('dashboard-register-user', (options: RegisterUserOptions) => {
    if (options && options.user) {
      users[parseInt(socket.id)] = {
        user: options.user,
        store: options.store
      }
    }
  })

  socket.on('dashboard-refresh-dataset', (options: RefreshDatasetOptions) => {
    const context: RunContext = {
      branch: 'master',
      repository: 'com.enonic.cms.default',
      principals: ['role:system.admin'],
      user: {
        login: users[parseInt(socket.id)].user,
        idProvider: users[parseInt(socket.id)].store ? users[parseInt(socket.id)].store : 'system'
      }
    }
    run(context, () => refreshDatasetHandler(options.ids, socketEmitter))
  })
}

function prepDataSources(dataSources: Array<Content<DataSource>>): Array<unknown> {
  return dataSources.map((dataSource) => {
    if (dataSource.data.dataSource) {
      const dataset: DatasetRepoNode<object | JSONstat | TbmlData> | undefined =
        fromDatasetRepoCache(`/${dataSource.data.dataSource._selected}/${extractKey(dataSource)}`, () => getDataset(dataSource))
      const hasData: boolean = !!dataset
      const queryLogNode: QueryLogNode | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataSource._id}`) as QueryLogNode
      return {
        id: dataSource._id,
        displayName: dataSource.displayName,
        path: dataSource._path,
        parentType: getParentType(dataSource._path),
        type: dataSource.type,
        format: dataSource.data.dataSource._selected,
        dataset: {
          modified: dataset ? dateToFormat(dataset._ts) : undefined,
          modifiedReadable: dataset ? dateToReadable(dataset._ts) : undefined
        },
        hasData,
        isPublished: isPublished(dataSource),
        logData: queryLogNode ? {
          ...queryLogNode.data,
          showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult as Events),
          message: i18n.localize({
            key: queryLogNode.data.modifiedResult
          }),
          modified: queryLogNode.data.modified,
          modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs),
          eventLogNodes: []
        } : undefined,
        eventLogNodes: [],
        loading: false,
        deleting: false
      }
    }
    return null
  })
}

function showWarningIcon(result: Events): boolean {
  return [
    Events.FAILED_TO_GET_DATA,
    Events.REQUEST_GOT_ERROR_RESPONSE,
    Events.FAILED_TO_CREATE_DATASET,
    Events.FAILED_TO_REFRESH_DATASET
  ].indexOf(result) >= 0
}

export function refreshDatasetHandler(ids: Array<string>, socketEmitter: SocketEmitter, branch: string = DATASET_BRANCH): void {
  // tell all dashboard instances that these are going to be loaded
  ids.forEach((id) => {
    socketEmitter.broadcast('dashboard-activity-refreshDataset', {
      id
    })
  })
  // start loading each datasource
  ids.forEach((id: string) => {
    const dataSource: Content<DataSource> | null = getContent({
      key: id
    })
    if (dataSource) {
      const refreshDatasetResult: CreateOrUpdateStatus = refreshDataset(dataSource, branch)
      logUserDataQuery(dataSource._id, {
        file: '/lib/ssb/dataset/dashboard.ts',
        function: 'refreshDatasetHandler',
        message: refreshDatasetResult.status
      })
      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', transfromQueryResult(refreshDatasetResult))
    } else {
      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', {
        id: id,
        message: i18n.localize({
          key: Events.FAILED_TO_FIND_DATAQUERY
        }),
        status: Events.FAILED_TO_FIND_DATAQUERY
      })
    }
  })
}

function transfromQueryResult(result: CreateOrUpdateStatus): DashboardRefreshResult {
  const nodes: QueryLogNode | readonly QueryLogNode[] | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${result.dataquery._id}`)
  let queryLogNode: QueryLogNode | null = null
  if (nodes) {
    if (Array.isArray(nodes)) {
      queryLogNode = nodes[0]
    } else {
      queryLogNode = nodes as QueryLogNode
    }
  }

  return {
    id: result.dataquery._id,
    message: i18n.localize({
      key: result.status
    }),
    status: result.status,
    dataset: result.dataset ? {
      newDatasetData: result.newDatasetData ? result.newDatasetData : false,
      modified: dateToFormat(result.dataset._ts),
      modifiedReadable: dateToReadable(result.dataset._ts)
    } : {},
    logData: queryLogNode ? {
      ...queryLogNode.data,
      showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult as Events),
      message: i18n.localize({
        key: queryLogNode.data.modifiedResult
      }),
      modified: queryLogNode.data.modified,
      modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs)
    } : {}
  }
}

interface QueryLogNode extends RepoNode {
  data: {
    queryId: string;
    modified: string;
    modifiedResult: string;
    modifiedTs: string;
    by: {
      type: string;
      key: string;
      displayName: string;
      disabled: boolean;
      email: string;
      login: string;
      idProvider: string;
    };
  };
}

interface DashboardRefreshResult {
  id: string;
  message: string;
  status: string;
  dataset: DashboardRefreshResultDataset | {};
  logData: DashboardRefreshResultLogData | {};
}

interface DashboardRefreshResultDataset {
  newDatasetData: boolean;
  modified: string;
  modifiedReadable: string;
}

interface DashboardRefreshResultLogData {
  message: string;
  modified: string;
  modifiedReadable: string;
}

export interface RegisterUserOptions {
  user: string;
  store: string;
}

export interface RefreshDatasetOptions {
  ids: Array<string>;
}

export interface DashboardDatasetLib {
  users: Array<RegisterUserOptions>;
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
  refreshDatasetHandler: (ids: Array<string>, socketEmitter: SocketEmitter, branch?: string) => void;
}
