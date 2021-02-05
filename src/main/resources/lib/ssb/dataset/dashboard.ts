__non_webpack_require__('/lib/polyfills/nashorn')
import { DatasetLib, CreateOrUpdateStatus } from './dataset'
import { ContentLibrary, Content } from 'enonic-types/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { Events, QueryInfoNode, RepoQueryLib } from '../../repo/query'
import { EVENT_LOG_REPO, EVENT_LOG_BRANCH, LogSummary, RepoEventLogLib } from '../../repo/eventLog'
import { NodeQueryHit, NodeQueryResponse, RepoNode } from 'enonic-types/node'
import { I18nLibrary } from 'enonic-types/i18n'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { Socket, SocketEmitter } from '../../types/socket'
import { SSBCacheLibrary } from '../cache'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { TbmlDataUniform } from '../../types/xmlParser'
import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { RepoCommonLib, withConnection } from '../../repo/common'
import { User } from 'enonic-types/auth'
import { TaskLib } from '../../types/task'
import { JobEventNode, JobInfoNode, JOB_STATUS_COMPLETE, JOB_STATUS_STARTED, RepoJobLib, StatisticsPublishResult } from '../../repo/job'
import { UtilLibrary } from '../../types/util'
import { StatRegStatisticsLib } from '../../repo/statreg/statistics'
import { StatisticInListing } from '../../ssb/statreg/types'
import { StatRegRefreshResult } from '../../repo/statreg'
import { StatRegJobInfo, SSBStatRegLib } from '../statreg'
import { DashboardUtilsLib, WARNING_ICON_EVENTS } from './dashboardUtils'

const {
  users,
  showWarningIcon
}: DashboardUtilsLib = __non_webpack_require__('/lib/ssb/dataset/dashboardUtils')
const {
  logUserDataQuery
}: RepoQueryLib = __non_webpack_require__( '/lib/repo/query')
const {
  getNode
}: RepoCommonLib = __non_webpack_require__( '/lib/repo/common')
const {
  refreshDataset,
  extractKey,
  getDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  get: getContent,
  query
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
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const {
  submit: submitTask
}: TaskLib = __non_webpack_require__('/lib/xp/task')
const {
  queryJobLogs,
  getJobLog,
  JobNames
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')
const {
  data: {
    forceArray
  }
}: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  getStatisticByIdFromRepo
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  parseStatRegJobInfo
}: SSBStatRegLib = __non_webpack_require__('/lib/ssb/statreg')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-error-queries', () => {
    submitTask({
      description: 'get-error-queries',
      task: () => {
        const contentWithDataSource: Array<unknown> = getDataSourcesWithError()
        socket.emit('error-queries-result', contentWithDataSource)
      }
    })
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

  socket.on('dashboard-register-user', (user: User) => {
    if (user) {
      users[parseInt(socket.id)] = user
    }
  })

  socket.on('dashboard-refresh-dataset', (options: RefreshDatasetOptions) => {
    const context: RunContext = {
      branch: 'master',
      repository: 'com.enonic.cms.default',
      principals: ['role:system.admin'],
      user: {
        login: users[parseInt(socket.id)].login,
        idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system'
      }
    }
    run(context, () => refreshDatasetHandler(options.ids, socketEmitter))
  })

  socket.on('dashboard-jobs', () => {
    submitTask({
      description: 'dashboard-jobs',
      task: () => {
        socket.emit('dashboard-jobs-result', getJobs())
      }
    })
  })
}

function getDataSourcesWithError(): Array<DashboardDataSource> {
  const errorLogNodes: Array<QueryInfoNode> = withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (connection) => {
    const errorLogResult: ReadonlyArray<NodeQueryHit> = connection.query({
      query: `_path LIKE "/queries/*" AND data.modifiedResult IN(${WARNING_ICON_EVENTS.map((e) => `"${e}"`).join(',')})`,
      count: 1000
    }).hits
    return errorLogResult.reduce((errorLogNodes: Array<QueryInfoNode>, errorLog) => {
      const errorLogNode: QueryInfoNode | null = connection.get(errorLog.id)
      if (errorLogNode) {
        errorLogNodes.push(errorLogNode)
      }
      return errorLogNodes
    }, [])
  })
  const dataSourcesWithError: Array<Content<DataSource>> = query({
    query: `_id IN(${errorLogNodes.map((s) => `"${s._name}"`).join(',')}) AND data.dataSource._selected LIKE "*"`,
    count: errorLogNodes.length
  }).hits as unknown as Array<Content<DataSource>>
  return dataSourcesWithError.map((dataSource: Content<DataSource>) => {
    const queryLogNode: QueryInfoNode | undefined = errorLogNodes.find((errorLog) => errorLog._name === dataSource._id)
    return buildDashboardDataSource(dataSource, queryLogNode)
  }).filter((ds) => !!ds) as Array<DashboardDataSource>
}

function getJobs(): Array<DashboardJobInfo> {
  return queryJobLogs({
    start: 0,
    count: 20,
    query: 'data.user.key = "user:system:cronjob" AND _path LIKE "/jobs/*"',
    sort: '_ts DESC'
  }).hits.reduce((result: Array<DashboardJobInfo>, j) => {
    const res: JobInfoNode | ReadonlyArray<JobInfoNode> | null = getJobLog(j.id)
    if (res) {
      const jobLog: JobInfoNode = Array.isArray(res) ? res[0] : res
      result.push({
        id: jobLog._id,
        task: jobLog.data.task,
        status: jobLog.data.status,
        startTime: jobLog.data.jobStarted,
        completionTime: jobLog.data.completionTime ? jobLog.data.completionTime : undefined,
        message: jobLog.data.message ? jobLog.data.message : '',
        result: parseResult(jobLog)
      })
    }
    return result
  }, [])
}

function parseResult(jobLog: JobInfoNode): Array<DashboardPublishJobResult> | Array<StatRegJobInfo> {
  if (jobLog.data.task === JobNames.PUBLISH_JOB) {
    const refreshDataResult: Array<StatisticsPublishResult> = forceArray(jobLog.data.refreshDataResult || []) as Array<StatisticsPublishResult>
    return refreshDataResult.map((statResult) => {
      const statregData: StatisticInListing | undefined = getStatisticByIdFromRepo(statResult.shortNameId)
      const statId: string = statResult.statistic
      const shortName: string = statregData ? statregData.shortName : statResult.shortNameId // get name from shortNameId
      const dataSources: DashboardPublishJobResult['dataSources'] = forceArray(statResult.dataSources).map((ds) => {
        const dataSource: Content<DataSource> | null = getContent({
          key: ds.id
        })
        return {
          id: ds.id,
          displayName: dataSource ? dataSource.displayName : ds.id,
          status: ds.status,
          type: dataSource?.type,
          datasetType: dataSource?.data?.dataSource?._selected,
          datasetKey: dataSource ? extractKey(dataSource) : undefined
        }
      })
      return {
        id: statId,
        shortName,
        status: statResult.status,
        dataSources
      }
    })
  } else if (jobLog.data.task === JobNames.STATREG_JOB) {
    const refreshDataResult: Array<StatRegRefreshResult> = forceArray(jobLog.data.refreshDataResult || []) as Array<StatRegRefreshResult>
    return parseStatRegJobInfo(refreshDataResult)
  }
  return []
}

interface DashboardPublishJobResult {
  id: string;
  shortName: string;
  status: string;
  dataSources: Array<{
    id: string;
    displayName: string;
    status: string;
    type?: string;
    datasetType?: string;
    datasetKey?: string;
  }>;
}
export interface DashboardJobInfo {
  id: string;
  task: string;
  status: typeof JOB_STATUS_STARTED | typeof JOB_STATUS_COMPLETE;
  startTime: string;
  completionTime?: string;
  message: string;
  result: Array<unknown>;
  user?: User;
}

function prepDataSources(dataSources: Array<Content<DataSource>>): Array<unknown> {
  return dataSources.map((dataSource) => {
    const queryLogNode: QueryInfoNode | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataSource._id}`) as QueryInfoNode
    return buildDashboardDataSource(dataSource, queryLogNode)
  })
}

function buildDashboardDataSource(dataSource: Content<DataSource>, queryLogNode: QueryInfoNode | undefined): DashboardDataSource | null {
  if (dataSource.data.dataSource?._selected) {
    const dataset: DatasetRepoNode<object | JSONstat | TbmlDataUniform> | undefined =
    fromDatasetRepoCache(`/${dataSource.data.dataSource._selected}/${extractKey(dataSource)}`, () => getDataset(dataSource))
    const hasData: boolean = !!dataset
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
        modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs)
      } : undefined
    }
  }
  return null
}

export function refreshDatasetHandler(
  ids: Array<string>,
  socketEmitter: SocketEmitter,
  processXmls?: Array<ProcessXml>,
  feedbackEventName?: string
): Array<RefreshDatasetResult> {
  // tell all dashboard instances that these are going to be loaded
  ids.forEach((id) => {
    socketEmitter.broadcast('dashboard-activity-refreshDataset', {
      id
    })
  })
  // start loading each datasource
  return ids.map((id: string, index: number) => {
    const dataSource: Content<DataSource> | null = getContent({
      key: id
    })
    if (dataSource) {
      const dataSourceKey: number = parseInt(extractKey(dataSource))

      feedbackEventName && socketEmitter.broadcast(feedbackEventName, {
        name: dataSource.displayName,
        datasourceKey: dataSourceKey,
        status: `Henter data for ${dataSource.displayName}`,
        step: 1,
        tableIndex: index
      })

      // only get credentials for this datasourceKey (in this case a tbml id)
      const ownerCredentialsForTbml: ProcessXml | undefined = processXmls ?
        processXmls.find((processXml: ProcessXml) => {
          return processXml.tbmlId === dataSourceKey
        }) : undefined
      // refresh data in draft only if there is owner credentials exists and fetchpublished is false
      const refreshDatasetResult: CreateOrUpdateStatus = refreshDataset(
        dataSource,
        ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH,
        ownerCredentialsForTbml ? ownerCredentialsForTbml.processXml : undefined)

      logUserDataQuery(dataSource._id, {
        file: '/lib/ssb/dataset/dashboard.ts',
        function: 'refreshDatasetHandler',
        message: refreshDatasetResult.status,
        branch: ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH
      })

      feedbackEventName && socketEmitter.broadcast(feedbackEventName, {
        name: dataSource.displayName,
        datasourceKey: dataSourceKey,
        status: i18n.localize({
          key: refreshDatasetResult.status
        }) === 'NOT_TRANSLATED' ?
          refreshDatasetResult.status : i18n.localize({
            key: refreshDatasetResult.status
          }),
        step: 2,
        tableIndex: index
      })

      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', transfromQueryResult(refreshDatasetResult))
      return {
        id,
        status: refreshDatasetResult.status,
        branch: ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH
      }
    } else {
      feedbackEventName && socketEmitter.broadcast(feedbackEventName, {
        status: `Fant ingen innhold med id ${id}`,
        step: 1,
        tableIndex: index
      })

      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', {
        id: id,
        message: i18n.localize({
          key: Events.FAILED_TO_FIND_DATAQUERY
        }),
        status: Events.FAILED_TO_FIND_DATAQUERY
      })
      return {
        id,
        status: Events.FAILED_TO_FIND_DATAQUERY,
        branch: DATASET_BRANCH
      }
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
  const queryLogMessage: string | null = queryLogNode && i18n.localize({
    key: queryLogNode.data.modifiedResult
  })
  return {
    id: result.dataquery._id,
    dataset: result.dataset ? {
      newDatasetData: result.hasNewData ? result.hasNewData : false,
      modified: dateToFormat(result.dataset._ts),
      modifiedReadable: dateToReadable(result.dataset._ts)
    } : {},
    logData: queryLogNode ? {
      ...queryLogNode.data,
      showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult as Events),
      message: queryLogMessage !== 'NOT_TRANSLATED' ? queryLogMessage : queryLogNode.data.modifiedResult,
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
  dataset: DashboardRefreshResultDataset | {};
  logData: DashboardRefreshResultLogData | {};
}

interface DashboardRefreshResultDataset {
  newDatasetData: boolean;
  modified: string;
  modifiedReadable: string;
}

export interface RefreshDatasetResult {
  id: string;
  status: string;
  branch: string;
}

export interface DashboardRefreshResultLogData {
  message: string;
  modified: string;
  modifiedReadable: string;
  showWarningIcon: boolean;
}

export interface RefreshDatasetOptions {
  ids: Array<string>;
}

export interface DashboardDatasetLib {
  users: Array<User>;
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
  showWarningIcon: (result: Events) => boolean;
  refreshDatasetHandler: (
    ids: Array<string>,
    socketEmitter: SocketEmitter,
    processXml?: Array<ProcessXml>,
    feedbackEventName?: string
  ) => Array<RefreshDatasetResult>;
}

export interface ProcessXml {
  tbmlId: number;
  processXml: string;
}

export interface DashboardDataSource {
  id: string;
  displayName: string;
  path: string;
  parentType: string;
  type: string;
  format: string;
  dataset: {
    modified?: string;
    modifiedReadable?: string;
  };
  hasData: boolean;
  isPublished: boolean;
  logData?: QueryInfoNode['data'] & {
    showWarningIcon: boolean;
    message: string;
    modified: string;
    modifiedReadable: string;
  };
}
