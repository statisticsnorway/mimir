__non_webpack_require__('/lib/polyfills/nashorn')
import { EventInfo, QueryInfoNode, QueryStatus } from '../repo/query'
import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { StatisticInListing, VariantInListing } from './statreg/types'
import { UtilLibrary } from '../types/util'
import { Statistics } from '../../site/content-types/statistics/statistics'
import { DashboardDatasetLib, ProcessXml, RefreshDatasetResult, DashboardJobInfo } from './dataset/dashboard'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { DatasetRepoNode } from '../repo/dataset'
import { DashboardUtilsLib } from './dataset/dashboardUtils'
import { I18nLibrary } from 'enonic-types/i18n'
import { Highchart } from '../../site/content-types/highchart/highchart'
import { Table } from '../../site/content-types/table/table'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { TbprocessorLib } from './dataset/tbprocessor'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { Source, TbmlDataUniform } from '../types/xmlParser'
import { JobEventNode, JobInfoNode, JobNames, JobStatus, RepoJobLib } from '../repo/job'
import { NodeQueryResponse, RepoConnection } from 'enonic-types/node'
import { RepoEventLogLib } from '../repo/eventLog'
import { RepoCommonLib } from '../repo/common'
import { StatRegStatisticsLib } from '../repo/statreg/statistics'
import { TaskLib } from '../types/task'
import { AuthLibrary } from 'enonic-types/auth'
import { PermissionsLib } from './permissions'
import { Dataset } from '../types/jsonstat-toolkit'

const {
  hasWritePermissions
}: PermissionsLib = __non_webpack_require__( '/lib/ssb/permissions')
const {
  query,
  get: getContent
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  fetchStatisticsWithRelease,
  getAllStatisticsFromRepo,
  getStatisticByIdFromRepo
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  data: {
    forceArray
  }
}: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  refreshDatasetHandler
}: DashboardDatasetLib = __non_webpack_require__('/lib/ssb/dataset/dashboard')
const {
  users
}: DashboardUtilsLib = __non_webpack_require__('/lib/ssb/dataset/dashboardUtils')

const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  getTbprocessor,
  getTbprocessorKey
}: TbprocessorLib = __non_webpack_require__('/lib/ssb/dataset/tbprocessor')
const {
  encrypt
} = __non_webpack_require__('/lib/cipher/cipher')
const {
  completeJobLog,
  updateJobLog,
  startJobLog
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')
const {
  withConnection,
  ENONIC_CMS_DEFAULT_REPO,
  getNode,
  queryNodes
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const i18n: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  submit: submitTask
}: TaskLib = __non_webpack_require__('/lib/xp/task')
const {
  hasRole
}: AuthLibrary = __non_webpack_require__('/lib/xp/auth')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    submitTask({
      description: 'get-statistics',
      task: () => {
        const context: RunContext = {
          branch: 'master',
          repository: ENONIC_CMS_DEFAULT_REPO,
          // principals: ['role:system.admin'],
          user: {
            login: users[parseInt(socket.id)].login,
            idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system'
          }
        }
        const statisticData: Array<StatisticDashboard> = run(context, () => getStatistics())
        socket.emit('statistics-result', statisticData)
      }
    })
  })

  socket.on('get-statistics-search-list', () => {
    submitTask({
      description: 'get-statistics-search-list',
      task: () => {
        const statisticsSearchData: Array<StatisticSearch> = getStatisticsSearchList()
        socket.emit('statistics-search-list-result', statisticsSearchData)
      }
    })
  })

  socket.on('get-statistics-owners-with-sources', (options: GetSourceListOwnersOptions) => {
    submitTask({
      description: 'get-statistics-owners-with-sources',
      task: () => {
        const ownersWithSources: Array<OwnerWithSources> = getOwnersWithSources(options.dataSourceIds)
        socket.emit('statistics-owners-with-sources-result', {
          id: options.id,
          ownersWithSources
        })
      }
    })
  })

  socket.on('get-statistics-job-log', (options: GenericIdParam) => {
    submitTask({
      description: 'get-statistics-job-log',
      task: () => {
        const jobLogs: Array<object> = getStatisticsJobLogInfo(options.id, 10)
        socket.emit('get-statistics-job-log-result', {
          id: options.id,
          jobLogs
        })
      }
    })
  })

  socket.on('get-statistic-job-log-details', (options: {id: string; statisticId: string}) => {
    submitTask({
      description: 'get-statistic-job-log-details',
      task: () => {
        const logDetails: Array<object> = getEventLogsFromStatisticsJobLog(options.id)
        socket.emit('get-statistic-job-log-details-result', {
          id: options.statisticId,
          logs: {
            jobId: options.id,
            logDetails: logDetails
          }
        })
      }
    })
  })

  socket.on('get-statistics-related-tables-and-owners-with-sources', (options: GetRelatedTablesOptions) => {
    submitTask({
      description: 'get-statistics-related-tables-and-owners-with-sources',
      task: () => {
        const statistic: Content<Statistics> | null = getContent({
          key: options.id
        })
        let relatedTables: Array<RelatedTbml> = []
        if (statistic) {
          relatedTables = getRelatedTables(statistic)
        }
        const ownersWithSources: Array<OwnerWithSources> = getOwnersWithSources(relatedTables.map((t) => t.queryId))
        socket.emit('statistics-related-tables-and-owners-with-sources-result', {
          id: options.id,
          relatedTables,
          ownersWithSources
        })
      }
    })
  })

  socket.on('refresh-statistic', (data: RefreshInfo) => {
    socketEmitter.broadcast('statistics-activity-refresh-started', {
      id: data.id
    })
    const statistic: Content<Statistics> | null = getContent({
      key: data.id
    })

    if (statistic) {
      const datasetIdsToUpdate: Array<string> = getDataSourceIdsFromStatistics(statistic)
      const processXmls: Array<ProcessXml> | undefined = data.owners ? processXmlFromOwners(data.owners) : undefined
      if (datasetIdsToUpdate.length > 0) {
        const context: RunContext = {
          branch: 'master',
          repository: ENONIC_CMS_DEFAULT_REPO,
          principals: ['role:system.admin'],
          user: {
            login: users[parseInt(socket.id)].login,
            idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system'
          }
        }
        run(context, () => {
          const jobLogNode: JobEventNode = startJobLog(JobNames.STATISTICS_REFRESH_JOB)
          updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
            node.data.queryIds = [data.id]
            return node
          })
          const feedbackEventName: string = 'statistics-activity-refresh-feedback'
          const refreshDataResult: Array<RefreshDatasetResult> = refreshDatasetHandler(
            datasetIdsToUpdate,
            socketEmitter,
            processXmls,
            feedbackEventName
          )
          const finishedJobLog: JobInfoNode = completeJobLog(jobLogNode._id, JobStatus.COMPLETE, refreshDataResult)
          socketEmitter.broadcast('statistics-refresh-result-log', {
            id: data.id,
            log: prepStatisticsJobLogInfo(finishedJobLog)
          })
        })
      }
      socketEmitter.broadcast('statistics-refresh-result', {
        id: data.id
      })
    }
    socketEmitter.broadcast('statistics-activity-refresh-complete', {
      id: data.id
    })
  })
}

function processXmlFromOwners(owners: Array<OwnerObject>): Array<ProcessXml> {
  const preRender: Array<SourceNodeRender> = owners.reduce((acc: Array<SourceNodeRender>, ownerObj: OwnerObject) => {
    // if the fetchPublished is set to on, do not create process xml
    // Only requests with xml will try to fetch unpublished data
    !ownerObj.fetchPublished && ownerObj.tbmlList && ownerObj.tbmlList.forEach( (tbmlIdObj: Tbml) => {
      const tbmlProcess: SourceNodeRender | undefined = acc.find((process: SourceNodeRender) => process.tbmlId === tbmlIdObj.tbmlId)
      if (tbmlProcess) {
        tbmlIdObj.sourceTableIds.forEach((sourceTable) => {
          tbmlProcess.sourceNodeStrings.push(`<source user="${ownerObj.username}" password="${encrypt(ownerObj.password)}" id="${sourceTable}"/>`)
        })
      } else {
        acc.push({
          tbmlId: tbmlIdObj.tbmlId,
          sourceNodeStrings: tbmlIdObj.sourceTableIds.map( (sourceTable) => {
            return `<source user="${ownerObj.username}" password="${encrypt(ownerObj.password)}" id="${sourceTable}"/>`
          })
        })
      }
    })
    return acc
  }, [])

  return preRender.map((sourceNode) => ({
    tbmlId: sourceNode.tbmlId,
    processXml: `<process>${sourceNode.sourceNodeStrings.join('')}</process>`
  }))
}

export function getDataSourceIdsFromStatistics(statistic: Content<Statistics>): Array<string> {
  const mainTableId: Array<string> = statistic.data.mainTable ? [statistic.data.mainTable] : []
  const statisticsKeyFigureId: Array<string> = statistic.data.statisticsKeyFigure ? [statistic.data.statisticsKeyFigure] : []
  const attachmentTablesFiguresIds: Array<string> = statistic.data.attachmentTablesFigures ? forceArray(statistic.data.attachmentTablesFigures) : []
  return [...mainTableId, ...statisticsKeyFigureId, ...attachmentTablesFiguresIds]
}

function getSourcesForUserFromStatistic(sources: Array<SourceList>): Array<OwnerWithSources> {
  return sources.reduce((acc: Array<OwnerWithSources>, source: SourceList) => {
    const {
      dataset
    } = source

    if (dataset.data &&
      typeof(dataset.data) !== 'string' &&
      dataset.data.tbml.metadata &&
      dataset.data.tbml.metadata.sourceList) {
      const tbmlId: number = dataset.data.tbml.metadata.instance.definitionId
      forceArray(dataset.data.tbml.metadata.sourceList).forEach((source: Source) => {
        const userIndex: number = acc.findIndex((it) => it.ownerId == source.owner)
        if (userIndex != -1) {
          const tbmlIndex: number = acc[userIndex].tbmlList.findIndex((it) => it.tbmlId == tbmlId)
          if (tbmlIndex == -1) {
            acc[userIndex].tbmlList.push({
              tbmlId: tbmlId,
              sourceTableIds: [source.id.toString()],
              statbankTableIds: [source.tableId.toString()]
            })
          } else {
            acc[userIndex].tbmlList[tbmlIndex].sourceTableIds.push(source.id.toString())
            acc[userIndex].tbmlList[tbmlIndex].statbankTableIds.push(source.tableId.toString())
          }
        } else {
          acc.push({
            ownerId: source.owner,
            tbmlList: [{
              tbmlId: tbmlId,
              sourceTableIds: [source.id.toString()],
              statbankTableIds: [source.tableId.toString()]
            }]

          })
        }
      })
    }
    return acc
  }, [])
}

function getDatasetFromContentId(contentId: string): DatasetRepoNode<TbmlDataUniform> | null {
  const queryResult: QueryResponse<Highchart | Table | KeyFigure> = query({
    query: `_id = '${contentId}'`,
    count: 1,
    filters: {
      exists: {
        field: 'data.dataSource.tbprocessor.urlOrId'
      }
    }
  })
  const content: Content<DataSource> | undefined = queryResult.count === 1 ? queryResult.hits[0] : undefined
  return content ? getTbprocessor(content, 'master') : null
}

function getOwnersWithSources(dataSourceIds: Array<string> ): Array<OwnerWithSources> {
  const datasets: Array<SourceList> = dataSourceIds.reduce((acc: Array<SourceList>, contentId: string) => {
    const dataset: DatasetRepoNode<TbmlDataUniform> | null = getDatasetFromContentId(contentId)
    if (dataset) {
      acc.push({
        dataset,
        queryId: contentId
      })
    }
    return acc
  }, [])
  return getSourcesForUserFromStatistic(datasets)
}

function getStatisticsJobLogInfo(id: string, count: number = 1): Array<DashboardJobInfo> {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (connection) => {
    const statisticsJobLog: NodeQueryResponse = connection.query({
      query: `_path LIKE "/jobs/*" AND data.task = "${JobNames.STATISTICS_REFRESH_JOB}" AND data.queryIds = "${id}"`,
      count,
      sort: '_ts DESC'
    })
    return statisticsJobLog.hits.reduce((res: Array<DashboardJobInfo>, jobRes) => {
      const jobNode: JobInfoNode | null = connection.get(jobRes.id)
      if (jobNode) {
        res.push(prepStatisticsJobLogInfo(jobNode))
      }
      return res
    }, [])
  })
}

function prepStatisticsJobLogInfo(jobNode: JobInfoNode): DashboardJobInfo {
  const jobResult: Array<RefreshDatasetResult> = forceArray(jobNode.data.refreshDataResult || []) as Array<RefreshDatasetResult>
  jobResult.forEach((datasetResult: RefreshDatasetResult) => {
    datasetResult.status = i18n.localize({
      key: datasetResult.status
    })
  })
  return {
    id: jobNode._id,
    startTime: jobNode.data.jobStarted,
    completionTime: jobNode.data.completionTime ? jobNode.data.completionTime : undefined,
    details: [],
    status: jobNode.data.status,
    task: jobNode.data.task,
    message: jobNode.data.message ? jobNode.data.message : '',
    result: jobResult,
    user: jobNode.data.user
  }
}

// NOTE example code to fetch event logs connected to datasources on statistics job log
function getEventLogsFromStatisticsJobLog(jobLogId: string): Array<object> {
  const jobInfoNode: JobInfoNode | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/jobs/${jobLogId}`) as JobInfoNode
  if (!jobInfoNode) {
    return []
  }
  const userLogin: string | undefined = jobInfoNode.data.user?.login
  const from: string = jobInfoNode.data.jobStarted
  const to: string = jobInfoNode.data.completionTime
  const datasets: Array<{id: string}> = forceArray(jobInfoNode.data.refreshDataResult) as Array<{id: string}> || []
  return datasets.map((dataset ) => {
    const datasetContent: Content<Highchart | Table | KeyFigure > | null = getContent({
      key: dataset.id
    })
    const eventLogResult: NodeQueryResponse = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
      query: `_path LIKE "/queries/${dataset.id}/*" AND data.by.login = "${userLogin}" AND range("_ts", instant("${from}"), instant("${to}"))`,
      count: 10,
      sort: '_ts DESC'
    })
    return {
      displayName: datasetContent?.displayName,
      eventLogResult: eventLogResult.hits.map((hit) => {
        const a: EventInfo | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataset.id}/${hit.id}`) as EventInfo
        return {
          id: hit.id,
          status: {
            ...a.data.status,
            message: i18n.localize({
              key: a.data.status.message
            })
          }
        }
      })
    }
  })
}

function checkIfUserIsAdmin(): boolean {
  return hasRole('system.admin')
}

const TWO_WEEKS: number = 14 // TODO: put in config?
function getStatistics(): Array<StatisticDashboard> {
  const userIsAdmin: boolean = checkIfUserIsAdmin()
  const statistic: Array<StatisticDashboard> = userIsAdmin ? getAdminStatistics() : getUserStatistics()
  return statistic.sort((a, b) => {
    return new Date(a.nextRelease || '01.01.3000').getTime() - new Date(b.nextRelease || '01.01.3000').getTime()
  })
}

function getAdminStatistics(): Array<StatisticDashboard> {
  const statsBeforeDate: Date = new Date()
  statsBeforeDate.setDate(statsBeforeDate.getDate() + TWO_WEEKS)
  const statregStatistics: Array<StatisticInListing> = fetchStatisticsWithRelease(statsBeforeDate)
  const statisticsContent: Array<Content<Statistics>> = query({
    query: `data.statistic IN(${statregStatistics.map((s) => `"${s.id}"`).join(',')})`,
    count: 1000
  }).hits as unknown as Array<Content<Statistics>>
  return statisticsContent.map( (statisticContent) => prepDashboardStatistics(statisticContent, statregStatistics))
}

function getUserStatistics(): Array<StatisticDashboard> {
  const userStatisticContent: Array<Content<Statistics>> = query({
    query: `data.statistic LIKE '*'`,
    contentTypes: [`${app.name}:statistics`],
    count: 1000
  }).hits.filter((statistic: Content<Statistics>) => hasWritePermissions(statistic._id)) as unknown as Array<Content<Statistics>>

  const userStatistic: Array<StatisticInListing> = userStatisticContent.reduce((acc: Array<StatisticInListing>, statistic) => {
    if (statistic.data.statistic) {
      const resultFromRepo: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
      if (resultFromRepo) acc.push(resultFromRepo)
    }
    return acc
  }, [])
  return userStatisticContent.map( (statisticContent) => prepDashboardStatistics(statisticContent, userStatistic))
}

function prepDashboardStatistics(statisticContent: Content<Statistics>, statregStatistics: Array<StatisticInListing>): StatisticDashboard {
  const prefix: string = app.config && app.config['admin-prefix'] ? app.config['admin-prefix'] : '/xp/admin'
  const statregStat: StatisticInListing | undefined = statregStatistics.find((statregStat) => {
    return `${statregStat.id}` === statisticContent.data.statistic
  })
  const statregData: StatregData = getStatregInfo(statregStat)
  const relatedTables: Array<RelatedTbml> = getRelatedTables(statisticContent)
  return {
    id: statisticContent._id,
    language: statisticContent.language ? statisticContent.language : '',
    name: statisticContent.displayName ? statisticContent.displayName : '',
    statisticId: statregData.statisticId,
    shortName: statregData.shortName,
    frequency: statregData.frequency,
    variantId: statregData.variantId,
    nextRelease: statregData.nextRelease,
    nextReleaseId: statregData.nextReleaseId,
    activeVariants: statregData.activeVariants,
    ownersWithSources: undefined,
    relatedTables: relatedTables,
    aboutTheStatistics: statisticContent.data.aboutTheStatistics,
    logData: getStatisticsJobLogInfo(statisticContent._id),
    previewUrl: statisticContent._path ? `${prefix}/site/preview/default/draft${statisticContent._path}` : ''
  }
}

function getRelatedTables(statistic: Content<Statistics>): Array<RelatedTbml> {
  const dataSourceIds: Array<string> = getDataSourceIdsFromStatistics(statistic)
  const dataSources: Array<Content<DataSource>> = query({
    count: dataSourceIds.length,
    query: 'data.dataSource._selected = "tbprocessor" AND data.dataSource.tbprocessor.urlOrId LIKE "*"',
    filters: {
      ids: {
        values: dataSourceIds
      }
    }
  }).hits as unknown as Array<Content<DataSource>>
  const relatedTables: Array<RelatedTbml> = dataSources.map((dataSource) => {
    return {
      queryId: dataSource._id,
      tbmlId: getTbprocessorKey(dataSource)
    }
  })

  return relatedTables
}

function getStatregInfo(statisticStatreg: StatisticInListing | undefined): StatregData {
  if (!statisticStatreg) {
    return {
      statisticId: -1,
      shortName: '',
      frequency: '',
      nextRelease: '',
      nextReleaseId: '',
      variantId: '',
      activeVariants: -1
    }
  }
  const variants: Array<VariantInListing> = forceArray(statisticStatreg.variants)
  if (variants.length > 1) {
    variants.sort((a: VariantInListing, b: VariantInListing) => new Date(a.nextRelease).getTime() - new Date(b.nextRelease).getTime())
  }
  const variant: VariantInListing = variants[0] // TODO: Multiple variants
  const result: StatregData = {
    statisticId: statisticStatreg.id,
    shortName: statisticStatreg.shortName,
    frequency: variant.frekvens,
    nextRelease: variant.nextRelease ? variant.nextRelease : '',
    nextReleaseId: variant.nextReleaseId ? variant.nextReleaseId : '',
    variantId: variant.id,
    activeVariants: variants.length
  }
  return result
}

function getStatisticsSearchList(): Array<StatisticSearch> {
  const statregStatistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const statisticsContent: Array<Content<Statistics>> = getStatisticsContent()
  return statisticsContent.map((statistics) => {
    const statregData: StatisticInListing | undefined = statregStatistics.find((s) => {
      return `${s.id}` === statistics.data.statistic
    })
    return {
      id: statistics._id,
      name: statistics.displayName,
      shortName: statregData?.shortName || ''
    }
  })
}

export function getStatisticsContent(): Array<Content<Statistics>> {
  let hits: Array<Content<Statistics>> = []
  const result: QueryResponse<Statistics> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 1000
  })
  hits = hits.concat(result.hits)
  return hits
}

interface SourceNodeRender {
  tbmlId: number;
  sourceNodeStrings: Array<string>;
}

interface SourceList {
  queryId: string;
  dataset: DatasetRepoNode<TbmlDataUniform>;
}

interface RefreshInfo {
  id: string;
  owners?: Array<OwnerObject>;
}

interface GetSourceListOwnersOptions {
  id: string;
  dataSourceIds: Array<string>;
}

interface GetRelatedTablesOptions {
  id: string;
}

interface GenericIdParam {
  id: string;
}

interface OwnerObject {
  username: string;
  password: string;
  tbmlList?: Array<Tbml>;
  ownerId: number;
  tbmlId: number;
  fetchPublished: true | undefined;
};

interface StatisticDashboard {
  id: string;
  previewUrl?: string;
  language?: string;
  name?: string;
  statisticId: number;
  shortName: string;
  frequency: string;
  variantId: string;
  nextRelease: string;
  nextReleaseId: string;
  activeVariants: number;
  relatedTables?: Array<RelatedTbml>;
  ownersWithSources?: Array<OwnerWithSources>;
  aboutTheStatistics?: string;
  logData: Array<DashboardJobInfo>;
}

interface StatisticSearch {
  id: string;
  shortName: string;
  name: string;
}

interface StatregData {
  statisticId: number;
  shortName: string;
  frequency: string;
  nextRelease: string;
  nextReleaseId: string;
  variantId: string;
  activeVariants: number;
}

interface RelatedTbml {
  queryId: string;
  tbmlId: string;
}

interface OwnerWithSources {
  ownerId: number;
  tbmlList: Array<Tbml>;
}

interface Tbml {
  tbmlId: number;
  sourceTableIds: Array<string>;
  statbankTableIds: Array<string>;
}

export interface StatisticLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
  getDataSourceIdsFromStatistics: (statistic: Content<Statistics>) => Array<string>;
  getStatisticsContent: () => Array<Content<Statistics>>;
}

