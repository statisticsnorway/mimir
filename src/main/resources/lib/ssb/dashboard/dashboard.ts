import '/lib/ssb/polyfills/nashorn'
import { get as getContent, query, Content } from '/lib/xp/content'
import { Node, NodeQueryResultHit } from '/lib/xp/node'
import { run, type ContextParams } from '/lib/xp/context'
import { User } from '/lib/xp/auth'
import { sanitize } from '/lib/xp/common'
import { localize } from '/lib/xp/i18n'
import { executeFunction } from '/lib/xp/task'
import { Events, QueryInfoNode, logUserDataQuery } from '/lib/ssb/repo/query'
import { EVENT_LOG_REPO, EVENT_LOG_BRANCH, LogSummary, getQueryChildNodesStatus } from '/lib/ssb/repo/eventLog'
import { Socket, SocketEmitter } from '/lib/types/socket'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '/lib/types/xmlParser'
import { DatasetRepoNode, DATASET_BRANCH, UNPUBLISHED_DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { withConnection, getNode, ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'
import {
  CalculatorRefreshResult,
  DatasetRefreshResult,
  JobInfoNode,
  JOB_STATUS_COMPLETE,
  JOB_STATUS_STARTED,
  StatisticsPublishResult,
  queryJobLogs,
  getJobLog,
  JobNames,
} from '/lib/ssb/repo/job'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { StatRegRefreshResult } from '/lib/ssb/repo/statreg'
import { StatRegJobInfo, parseStatRegJobInfo } from '/lib/ssb/dashboard/statreg'
import { users, showWarningIcon, WARNING_ICON_EVENTS, isPublished } from '/lib/ssb/dashboard/dashboardUtils'
import { dateToFormat, dateToReadable } from '/lib/ssb/utils/utils'
import { getParentType } from '/lib/ssb/utils/parentUtils'

import { fromDatasetRepoCache } from '/lib/ssb/cache/cache'
import { CreateOrUpdateStatus, refreshDataset, extractKey, getDataset } from '/lib/ssb/dataset/dataset'
import * as util from '/lib/util'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { createOrUpdateNameGraphRepo } from '/lib/ssb/repo/nameGraph'
import { getNameSearchGraphDatasetId } from '/lib/ssb/dataset/calculator'
import { type Page, type Statistics } from '/site/content-types'
import { type Default as DefaultPageConfig } from '/site/pages/default'
import { type DataSource } from '/site/mixins/dataSource'

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-error-data-sources', () => {
    executeFunction({
      description: 'get-error-data-sources',
      func: () => {
        const contentWithDataSource: Array<DashboardDataSource> = getDataSourcesWithError()
        socket.emit('error-data-sources-result', contentWithDataSource)
      },
    })
  })

  socket.on('get-fact-page-groups', () => {
    executeFunction({
      description: 'get-fact-page-groups',
      func: () => {
        const factpages: Array<DashboardDataSourceGroups> = getFactPageGroups()
        socket.emit('fact-page-groups-result', factpages)
      },
    })
  })

  socket.on('get-fact-page-data-sources', (id: string) => {
    executeFunction({
      description: 'get-fact-page-data-sources',
      func: () => {
        const dataSources: Array<DashboardDataSource> = prepDataSources(getFactPageDataSources(id))
        socket.emit('fact-page-data-sources-result', {
          id,
          dataSources,
        })
      },
    })
  })

  socket.on('get-statistics-groups', () => {
    executeFunction({
      description: 'get-statistics-groups',
      func: () => {
        const statistics: Array<DashboardDataSourceGroups> = getStatisticsGroups()
        socket.emit('statistics-groups-result', statistics)
      },
    })
  })

  socket.on('get-statistics-data-sources', (id: string) => {
    executeFunction({
      description: 'get-statistics-data-sources',
      func: () => {
        const dataSources: Array<DashboardDataSource> = prepDataSources(getStatisticsDataSources(id))
        socket.emit('statistics-data-sources-result', {
          id,
          dataSources,
        })
      },
    })
  })

  socket.on('get-municipal-groups', () => {
    executeFunction({
      description: 'get-municipal-groups',
      func: () => {
        const municipals: Array<DashboardDataSourceGroups> = getMunicipalGroups()
        socket.emit('municipal-groups-result', municipals)
      },
    })
  })

  socket.on('get-municipal-data-sources', (id: string) => {
    executeFunction({
      description: 'get-municipal-data-sources',
      func: () => {
        const dataSources: Array<DashboardDataSource> = prepDataSources(getMunicipalDataSources(id))
        socket.emit('municipal-data-sources-result', {
          id,
          dataSources,
        })
      },
    })
  })

  socket.on('get-default-data-sources', () => {
    executeFunction({
      description: 'get-default-data-sources',
      func: () => {
        const dataSources: Array<DashboardDataSource> = getDefaultDataSources()
        socket.emit('default-data-sources-result', dataSources)
      },
    })
  })

  socket.on('get-eventlog-node', (dataQueryId) => {
    let status: Array<LogSummary> | undefined = getQueryChildNodesStatus(`/queries/${dataQueryId}`) as
      | Array<LogSummary>
      | undefined
    if (!status) {
      status = []
    }
    socket.emit('eventlog-node-result', {
      logs: status,
      id: dataQueryId,
    })
  })

  socket.on('dashboard-register-user', (user: User) => {
    if (user) {
      users[parseInt(socket.id)] = user
    }
  })

  socket.on('dashboard-refresh-dataset', (options: RefreshDatasetOptions) => {
    const context: ContextParams = {
      branch: 'master',
      repository: ENONIC_CMS_DEFAULT_REPO,
      principals: ['role:system.admin'],
      user: {
        login: users[parseInt(socket.id)].login,
        idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system',
      },
    }
    run(context, () => refreshDatasetHandler(options.ids, socketEmitter))
  })

  socket.on('dashboard-jobs', () => {
    executeFunction({
      description: 'dashboard-jobs',
      func: () => {
        socket.emit('dashboard-jobs-result', getJobs())
      },
    })
  })

  socket.on('dashboard-server-time', () => {
    socket.emit('dashboard-server-time-result', new Date().toISOString())
  })

  socket.on('dashboard-refresh-namegraph', () => {
    const datasetId: string | undefined = getNameSearchGraphDatasetId()
    let status: string
    if (datasetId) {
      const context: ContextParams = {
        branch: 'master',
        repository: ENONIC_CMS_DEFAULT_REPO,
        principals: ['role:system.admin'],
        user: {
          login: users[parseInt(socket.id)].login,
          idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system',
        },
      }
      const apiData: RefreshDatasetResult[] = run(context, () => refreshDatasetHandler([datasetId], socketEmitter))
      const statusApi: string = localize({
        key: apiData[0].status,
      })

      createOrUpdateNameGraphRepo()
      status = `Data statbankApi: ${statusApi}, Repo nameGraph er oppdatert`
    } else {
      status = 'Henting av data fra StatbankApi feilet pga manglende datasetId'
    }

    socket.emit('refresh-namegraph-finished', {
      status: status,
    })
  })
}

function getDataSourcesWithError(): Array<DashboardDataSource> {
  const errorLogNodes: Array<QueryInfoNode> = withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (connection) => {
    const errorLogResult = connection.query({
      query: `_path LIKE "/queries/*" AND data.modifiedResult IN(${WARNING_ICON_EVENTS.map((e) => `"${e}"`).join(
        ','
      )})`,
      count: 1000,
    }).hits
    return errorLogResult.reduce((errorLogNodes: Array<QueryInfoNode>, errorLog) => {
      // deepcode ignore Sqli: NoQL. get is an xp function that fetches content from the repositories in xp
      const errorLogNode: QueryInfoNode | null = connection.get(sanitize(errorLog.id))
      if (errorLogNode) {
        errorLogNodes.push(errorLogNode)
      }
      return errorLogNodes
    }, [])
  })
  if (errorLogNodes.length === 0) {
    return []
  }
  const dataSourcesWithError: Array<Content<DataSource>> = query({
    query: `_id IN(${errorLogNodes
      .map((s) => `"${s._name}"`)
      .join(',')}) AND data.dataSource._selected LIKE "*" AND data.dataSource._selected NOT LIKE "htmlTable"`,
    count: errorLogNodes.length,
  }).hits as unknown as Array<Content<DataSource>>
  return dataSourcesWithError
    .map((dataSource: Content<DataSource>) => {
      const queryLogNode: QueryInfoNode | undefined = errorLogNodes.find(
        (errorLog) => errorLog._name === dataSource._id
      )
      return buildDashboardDataSource(dataSource, queryLogNode)
    })
    .filter((ds) => !!ds) as Array<DashboardDataSource>
}

function getFactPageGroups(): Array<DashboardDataSourceGroups> {
  const factPages: Array<Content<Page & DefaultPageConfig>> = query({
    query: `components.page.config.mimir.default.pageType LIKE "factPage"`,
    count: 1000,
  }).hits as unknown as Array<Content<Page & DefaultPageConfig>>

  return factPages.map((factPage) => {
    return {
      id: factPage._id,
      displayName: factPage.displayName,
      path: factPage._path,
      loading: false,
      dataSources: undefined,
    }
  })
}

function getFactPageDataSources(factPageId: string): Array<Content<DataSource>> {
  const factPage: Content<Page> | null = getContent({
    key: factPageId,
  })
  if (factPage) {
    const hits: Array<Content<DataSource>> = query({
      query: `_path LIKE "/content${factPage._path}/*" AND data.dataSource._selected LIKE "*" AND data.dataSource._selected NOT LIKE "htmlTable"`,
      count: 1000,
    }).hits as unknown as Array<Content<DataSource>>
    return hits
  }
  return []
}

function getStatisticsGroups(): Array<DashboardDataSourceGroups> {
  const statistics: Array<Content<Statistics>> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 1000,
  }).hits as unknown as Array<Content<Statistics>>
  return statistics.map((statistic) => {
    return {
      id: statistic._id,
      displayName: statistic.displayName,
      path: statistic._path,
      loading: false,
      dataSources: undefined,
    }
  })
}

function getStatisticsDataSources(statisticId: string): Array<Content<DataSource>> {
  const statistic: Content<Page> | null = getContent({
    key: statisticId,
  })
  if (statistic) {
    const hits: Array<Content<DataSource>> = query({
      query: `_path LIKE "/content${statistic._path}/*" AND data.dataSource._selected LIKE "*" AND data.dataSource._selected NOT LIKE "htmlTable"`,
      count: 100,
    }).hits as unknown as Array<Content<DataSource>>
    return hits
  }
  return []
}

function getMunicipalGroups(): Array<DashboardDataSourceGroups> {
  const municipals: Array<Content<Page & DefaultPageConfig>> = query({
    query: `components.page.config.mimir.default.pageType LIKE "municipality" AND _parentPath LIKE "/content/ssb"`,
    count: 5,
  }).hits as unknown as Array<Content<Page & DefaultPageConfig>>

  return municipals.map((municipal) => {
    return {
      id: municipal._id,
      displayName: municipal.displayName,
      path: municipal._path,
      loading: false,
      dataSources: undefined,
    }
  })
}

function getMunicipalDataSources(municipalId: string): Array<Content<DataSource>> {
  const municipal: Content<Page> | null = getContent({
    key: municipalId,
  })
  if (municipal) {
    const hits: Array<Content<DataSource>> = query({
      query: `_path LIKE "/content${municipal._path}/*" AND data.dataSource._selected LIKE "*" AND data.dataSource._selected NOT LIKE "htmlTable"`,
      count: 100,
    }).hits as unknown as Array<Content<DataSource>>
    return hits
  }
  return []
}

function getDefaultDataSources(): Array<DashboardDataSource> {
  // We want all the data sources that are not in the groups below
  const factPageDataSourceIds: string[][] = getFactPageGroups().map((g) =>
    getFactPageDataSources(g.id).map((ds) => ds._id)
  )
  const municipalDataSourceIds: string[][] = getMunicipalGroups().map((g) =>
    getMunicipalDataSources(g.id).map((ds) => ds._id)
  )
  const statisticsDataSourceIds: string[][] = getStatisticsGroups().map((g) =>
    getStatisticsDataSources(g.id).map((ds) => ds._id)
  )

  const dataSourceIds = [
    ...factPageDataSourceIds.reduce((acc, g) => [...acc, ...g], []),
    ...municipalDataSourceIds.reduce((acc, g) => [...acc, ...g], []),
    ...statisticsDataSourceIds.reduce((acc, g) => [...acc, ...g], []),
  ]
  const hits: Array<Content<DataSource>> = query({
    query: `data.dataSource._selected LIKE "*" AND data.dataSource._selected NOT LIKE "htmlTable"`,
    filters: {
      boolean: {
        mustNot: {
          ids: {
            values: dataSourceIds,
          },
        },
      },
    },
    count: 10000,
  }).hits as unknown as Array<Content<DataSource>>

  return prepDataSources(hits)
}

function getJobs(): Array<DashboardJobInfo> {
  return queryJobLogs({
    start: 0,
    count: 20,
    query: 'data.user.key = "user:system:cronjob" AND _path LIKE "/jobs/*"',
    sort: '_ts DESC',
  }).hits.reduce((result: Array<DashboardJobInfo>, j: NodeQueryResultHit) => {
    const res = getJobLog(j.id)
    if (res) {
      const jobLog: JobInfoNode = Array.isArray(res) ? res[0] : res
      result.push({
        id: jobLog._id,
        task: jobLog.data.task,
        status: jobLog.data.status,
        startTime: jobLog.data.jobStarted,
        completionTime: jobLog.data.completionTime ? jobLog.data.completionTime : undefined,
        message: jobLog.data.message ? jobLog.data.message : '',
        result: parseResult(jobLog),
        details: [],
      })
    }
    return result
  }, [])
}

function parseResult(
  jobLog: JobInfoNode
): Array<DashboardPublishJobResult> | Array<StatRegJobInfo> | DatasetRefreshResult | CalculatorRefreshResult {
  if (jobLog.data.task === JobNames.PUBLISH_JOB) {
    const refreshDataResult: Array<StatisticsPublishResult> = util.data.forceArray(
      jobLog.data.refreshDataResult || []
    ) as Array<StatisticsPublishResult>
    return refreshDataResult.map((statResult) => {
      const statregData: StatisticInListing | undefined = getStatisticByIdFromRepo(statResult.shortNameId)
      const statId: string = statResult.statistic
      const shortName: string = statregData ? statregData.shortName : statResult.shortNameId // get name from shortNameId
      const dataSources: DashboardPublishJobResult['dataSources'] = util.data
        .forceArray(statResult.dataSources || [])
        .map((ds) => {
          try {
            const dataSource: Content<DataSource> | null = getContent({
              key: ds.id,
            })
            return {
              id: ds.id,
              displayName: dataSource ? dataSource.displayName : ds.id,
              status: ds.status,
              type: dataSource?.type,
              datasetType: dataSource?.data?.dataSource?._selected,
              datasetKey: dataSource ? extractKey(dataSource) : undefined,
            }
          } catch (e) {
            return {
              id: ds.id,
              displayName: ds.id,
              status: ds.status,
              type: `Datakilde finnes ikke lengre`,
              datasetType: '',
              datasetKey: 'innhold arkivert!!',
            }
          }
        })
      return {
        id: statId,
        shortName,
        status: statResult.status,
        dataSources,
      }
    })
  } else if (jobLog.data.task === JobNames.STATREG_JOB) {
    const refreshDataResult: Array<StatRegRefreshResult> = util.data.forceArray(
      jobLog.data.refreshDataResult || []
    ) as Array<StatRegRefreshResult>
    return parseStatRegJobInfo(refreshDataResult)
  } else if (jobLog.data.task === JobNames.REFRESH_DATASET_JOB) {
    let result: DatasetRefreshResult | undefined = jobLog.data.refreshDataResult as DatasetRefreshResult | undefined
    if (!result || !result.filterInfo) {
      result = {
        filterInfo: {
          start: [],
          end: [],
          inRSSOrNoKey: [],
          noData: [],
          otherDataType: [],
          statistics: [],
          skipped: [],
        },
        result: [],
      }
    }
    result.filterInfo.start = util.data.forceArray(result.filterInfo.inRSSOrNoKey || [])
    result.filterInfo.inRSSOrNoKey = util.data.forceArray(result.filterInfo.inRSSOrNoKey || [])
    result.filterInfo.noData = util.data.forceArray(result.filterInfo.noData || [])
    result.filterInfo.otherDataType = util.data.forceArray(result.filterInfo.otherDataType) || []
    result.filterInfo.skipped = util.data.forceArray(result.filterInfo.skipped || [])
    result.filterInfo.end = util.data.forceArray(result.filterInfo.end || [])
    result.filterInfo.statistics = util.data.forceArray(result.filterInfo.statistics || [])
    result.result = util.data.forceArray(result.result || []).map((ds) => {
      ds.hasError = showWarningIcon(ds.status as Events)
      ds.status = localize({
        key: ds.status,
      })
      return ds
    })
    return result
  } else if (
    jobLog.data.task === JobNames.REFRESH_DATASET_CALCULATOR_JOB ||
    jobLog.data.task === JobNames.REFRESH_DATASET_SDDS_TABLES_JOB
  ) {
    let result: CalculatorRefreshResult | undefined = jobLog.data.refreshDataResult as
      | CalculatorRefreshResult
      | undefined
    if (!result) {
      result = {
        result: [],
      }
    }
    result.result = util.data.forceArray(result.result || []).map((ds) => {
      ds.hasError = showWarningIcon(ds.status as Events)
      ds.status = localize({
        key: ds.status,
      })
      return ds
    })
    return result
  }
  return []
}

interface DashboardPublishJobResult {
  id: string
  shortName: string
  status: string
  dataSources: Array<{
    id: string
    displayName: string
    status: string
    type?: string
    datasetType?: string
    datasetKey?: string
  }>
}
export interface DashboardJobInfo {
  id: string
  task: string
  status: typeof JOB_STATUS_STARTED | typeof JOB_STATUS_COMPLETE
  startTime: string
  completionTime?: string
  message: string
  result: Array<unknown> | object
  user?: User
  details: Array<object>
}

function prepDataSources(dataSources: Array<Content<DataSource>>): Array<DashboardDataSource> {
  return dataSources.reduce((dashboardDataSources: Array<DashboardDataSource>, dataSource) => {
    const queryLogNode: QueryInfoNode | null = getNode(
      EVENT_LOG_REPO,
      EVENT_LOG_BRANCH,
      `/queries/${dataSource._id}`
    ) as QueryInfoNode
    const dashboardDataSource: DashboardDataSource | null = buildDashboardDataSource(dataSource, queryLogNode)
    if (dashboardDataSource) {
      dashboardDataSources.push(dashboardDataSource)
    }
    return dashboardDataSources
  }, [])
}

function buildDashboardDataSource(
  dataSource: Content<DataSource>,
  queryLogNode: QueryInfoNode | undefined
): DashboardDataSource | null {
  if (dataSource.data.dataSource?._selected) {
    const dataset: DatasetRepoNode<object | JSONstat | TbmlDataUniform> | undefined = fromDatasetRepoCache(
      `/${dataSource.data.dataSource._selected}/${extractKey(dataSource)}`,
      () => getDataset(dataSource)
    )
    const hasData = !!dataset
    return {
      id: dataSource._id,
      displayName: dataSource.displayName,
      path: dataSource._path,
      parentType: getParentType(dataSource._path),
      type: dataSource.type,
      format: dataSource.data.dataSource._selected,
      dataset: {
        modified: dataset ? dateToFormat(dataset._ts) : undefined,
        modifiedReadable: dataset ? dateToReadable(dataset._ts) : undefined,
      },
      hasData,
      isPublished: isPublished(dataSource),
      logData: queryLogNode
        ? {
            ...queryLogNode.data,
            showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult as Events),
            message: localize({
              key: queryLogNode.data.modifiedResult,
            }),
            modified: queryLogNode.data.modified,
            modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs),
          }
        : undefined,
    }
  }
  return null
}

export function refreshDatasetHandler(
  ids: Array<string>,
  socketEmitter: SocketEmitter,
  processXmls?: Array<ProcessXml>,
  feedbackEventName?: string,
  relatedStatisticsId?: string
): Array<RefreshDatasetResult> {
  // tell all dashboard instances that these are going to be loaded

  ids.forEach((id) => {
    socketEmitter.broadcast('dashboard-activity-refreshDataset', {
      id,
    })
  })
  // start loading each datasource
  return ids.map((id: string, index: number) => {
    const dataSource: Content<DataSource> | null = getContent({
      key: id,
    })
    if (dataSource) {
      const dataSourceKey: number = parseInt(extractKey(dataSource))

      feedbackEventName &&
        socketEmitter.broadcast(feedbackEventName, {
          name: dataSource.displayName,
          datasourceKey: dataSourceKey,
          status: `Henter data for ${dataSource.displayName}`,
          step: 1,
          tableIndex: index,
          relatedStatisticsId: relatedStatisticsId ? relatedStatisticsId : undefined,
        })

      // only get credentials for this datasourceKey (in this case a tbml id)
      const ownerCredentialsForTbml: ProcessXml | undefined = processXmls
        ? processXmls.find((processXml: ProcessXml) => {
            return processXml.tbmlId.toString() === dataSourceKey.toString()
          })
        : undefined
      // refresh data in draft only if there is owner credentials exists and fetchpublished is false
      const refreshDatasetResult: CreateOrUpdateStatus = refreshDataset(
        dataSource,
        ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH,
        ownerCredentialsForTbml ? ownerCredentialsForTbml.processXml : undefined
      )

      refreshDatasetResult.sourceListStatus &&
        logUserDataQuery(dataSource._id, {
          file: '/lib/ssb/dataset/dashboard.ts',
          function: 'refreshDatasetHandler',
          message: refreshDatasetResult.sourceListStatus,
          branch: ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH,
        })

      logUserDataQuery(dataSource._id, {
        file: '/lib/ssb/dataset/dashboard.ts',
        function: 'refreshDatasetHandler',
        message: refreshDatasetResult.status,
        branch: ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH,
      })

      feedbackEventName &&
        socketEmitter.broadcast(feedbackEventName, {
          name: dataSource.displayName,
          datasourceKey: dataSourceKey,
          status: localize({
            key: refreshDatasetResult.status,
          }),
          step: 2,
          tableIndex: index,
          relatedStatisticsId: relatedStatisticsId ? relatedStatisticsId : undefined,
        })

      feedbackEventName &&
        refreshDatasetResult.sourceListStatus &&
        socketEmitter.broadcast(feedbackEventName, {
          name: dataSource.displayName,
          datasourceKey: dataSourceKey,
          status: localize({
            key: refreshDatasetResult.sourceListStatus,
          }),
          step: 2,
          tableIndex: index,
          relatedStatisticsId: relatedStatisticsId ? relatedStatisticsId : undefined,
        })

      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', transfromQueryResult(refreshDatasetResult))
      return {
        id,
        status: refreshDatasetResult.status,
        branch: ownerCredentialsForTbml ? UNPUBLISHED_DATASET_BRANCH : DATASET_BRANCH,
      }
    } else {
      feedbackEventName &&
        socketEmitter.broadcast(feedbackEventName, {
          status: `Fant ingen innhold med id ${id}`,
          step: 1,
          tableIndex: index,
          relatedStatisticsId: relatedStatisticsId ? relatedStatisticsId : undefined,
        })

      socketEmitter.broadcast('dashboard-activity-refreshDataset-result', {
        id: id,
        message: localize({
          key: Events.FAILED_TO_FIND_DATAQUERY,
        }),
        status: Events.FAILED_TO_FIND_DATAQUERY,
      })
      return {
        id,
        status: Events.FAILED_TO_FIND_DATAQUERY,
        branch: DATASET_BRANCH,
      }
    }
  })
}

function transfromQueryResult(result: CreateOrUpdateStatus): DashboardRefreshResult {
  const nodes = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${result.dataquery._id}`) as QueryLogNode | null
  let queryLogNode: QueryLogNode | null = null
  if (nodes) {
    if (Array.isArray(nodes)) {
      queryLogNode = nodes[0]
    } else {
      queryLogNode = nodes as QueryLogNode
    }
  }
  const queryLogMessage: string | null =
    queryLogNode &&
    localize({
      key: queryLogNode.data.modifiedResult,
    })
  return {
    id: result.dataquery._id,
    dataset: result.dataset
      ? {
          newDatasetData: result.hasNewData ? result.hasNewData : false,
          modified: dateToFormat(result.dataset._ts),
          modifiedReadable: dateToReadable(result.dataset._ts),
        }
      : {},
    logData: queryLogNode
      ? {
          ...queryLogNode.data,
          showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult as Events),
          message: queryLogMessage !== 'NOT_TRANSLATED' ? queryLogMessage : queryLogNode.data.modifiedResult,
          modified: queryLogNode.data.modified,
          modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs),
        }
      : {},
  }
}

interface QueryLogNode extends Node {
  data: {
    queryId: string
    modified: string
    modifiedResult: string
    modifiedTs: string
    by: {
      type: string
      key: string
      displayName: string
      disabled: boolean
      email: string
      login: string
      idProvider: string
    }
  }
}

interface DashboardRefreshResult {
  id: string
  dataset: DashboardRefreshResultDataset | {}
  logData: DashboardRefreshResultLogData | {}
}

interface DashboardRefreshResultDataset {
  newDatasetData: boolean
  modified: string
  modifiedReadable: string
}

export interface RefreshDatasetResult {
  id: string
  status: string
  branch: string
}

export interface DashboardRefreshResultLogData {
  message: string
  modified: string
  modifiedReadable: string
  showWarningIcon: boolean
}

export interface RefreshDatasetOptions {
  ids: Array<string>
}

export interface ProcessXml {
  tbmlId: string
  processXml: string
}

export interface DashboardDataSource {
  id: string
  displayName: string
  path: string
  parentType?: string
  type: string
  format: string
  dataset: {
    modified?: string
    modifiedReadable?: string
  }
  hasData: boolean
  isPublished: boolean
  logData?: QueryInfoNode['data'] & {
    showWarningIcon: boolean
    message: string
    modified: string
    modifiedReadable: string
  }
}

export interface DashboardDataSourceGroups {
  id: string
  displayName: string
  path: string
  loading: boolean
  dataSources?: Array<string>
}
