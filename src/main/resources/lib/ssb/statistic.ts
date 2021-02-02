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
__non_webpack_require__('/lib/polyfills/nashorn')

import moment = require('moment')

import { Highchart } from '../../site/content-types/highchart/highchart'
import { Table } from '../../site/content-types/table/table'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { TbprocessorLib } from './dataset/tbprocessor'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { Source, TbmlDataUniform } from '../types/xmlParser'
import { JobEventNode, JobInfoNode, JobNames, JobStatus, RepoJobLib } from '../repo/job'
import { NodeQueryResponse } from 'enonic-types/node'
import { RepoEventLogLib } from '../repo/eventLog'
import { RepoCommonLib } from '../repo/common'

const {
  query,
  get: getContent
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
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
  getTbprocessor
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
  withConnection
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const i18n: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    const statisticData: Array<StatisticDashboard> = prepStatistics(getStatistics())
    socket.emit('statistics-result', statisticData)
  })

  socket.on('refresh-statistic', (data: RefreshInfo) => {
    socketEmitter.broadcast('statistics-activity-refresh-started', {
      id: data.id
    })
    const statistic: Content<Statistics> | null = getContent({
      key: data.id
    })

    if (statistic) {
      const datasetIdsToUpdate: Array<string> = getDatasetIdsFromStatistic(statistic)
      const processXmls: Array<ProcessXml> | undefined = data.owners ? processXmlFromOwners(data.owners) : undefined
      if (datasetIdsToUpdate.length > 0) {
        const context: RunContext = {
          branch: 'master',
          repository: 'com.enonic.cms.default',
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

export function getDatasetIdsFromStatistic(statistic: Content<Statistics>): Array<string> {
  const mainTableId: Array<string> = statistic.data.mainTable ? [statistic.data.mainTable] : []
  const statisticsKeyFigureId: Array<string> = statistic.data.statisticsKeyFigure ? [statistic.data.statisticsKeyFigure] : []
  const attachmentTablesFiguresIds: Array<string> = statistic.data.attachmentTablesFigures ? forceArray(statistic.data.attachmentTablesFigures) : []
  return [...mainTableId, ...statisticsKeyFigureId, ...attachmentTablesFiguresIds]
}

function getDatasetFromStatistics(statistic: Content<Statistics>): Array<SourceList> {
  const datasetIds: Array<string> = getDatasetIdsFromStatistic(statistic)
  const sources: Array<SourceList> = datasetIds.reduce((acc: Array<SourceList>, contentId: string) => {
    const dataset: DatasetRepoNode<TbmlDataUniform> | null = getDatasetFromContentId(contentId)
    if (dataset) {
      acc.push({
        dataset,
        queryId: contentId
      })
    }
    return acc
  }, [])
  return sources
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

function prepStatistics(statistics: Array<Content<Statistics>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  statistics.map((statistic: Content<Statistics>) => {
    try {
      const statregData: StatregData | undefined = statistic.data.statistic ? getStatregInfo(statistic.data.statistic) : undefined
      if (statregData) {
        const datasets: Array<SourceList> = getDatasetFromStatistics(statistic)
        const relatedUserTBMLs: Array<OwnerWithSources> = getSourcesForUserFromStatistic(datasets)
        const relatedTables: Array<RelatedTbml> = datasets.reduce((acc: Array<RelatedTbml>, tbml) => {
          const {
            dataset,
            queryId
          } = tbml
          if (dataset.data &&
              typeof(dataset.data) !== 'string' &&
              dataset.data.tbml.metadata &&
              dataset.data.tbml.metadata.sourceList) {
            const tbmlId: string = dataset.data.tbml.metadata.instance.definitionId.toString()
            acc.push({
              tbmlId,
              queryId
            })
          }
          return acc
        }, [])
        const statisticDataDashboard: StatisticDashboard = {
          id: statistic._id,
          language: statistic.language ? statistic.language : '',
          name: statistic.displayName ? statistic.displayName : '',
          statisticId: statregData.statisticId,
          shortName: statregData.shortName,
          frequency: statregData.frequency,
          variantId: statregData.variantId,
          nextRelease: undefined,
          nextReleaseId: undefined,
          relatedUserTBMLs,
          relatedTables,
          aboutTheStatistics: statistic.data.aboutTheStatistics,
          logData: getStatisticsJobLogInfo(statistic._id)
        }
        if (statregData && statregData.nextRelease && moment(statregData.nextRelease).isSameOrAfter(new Date(), 'day')) {
          statisticDataDashboard.nextRelease = statregData.nextRelease ? statregData.nextRelease : ''
          statisticDataDashboard.nextReleaseId = statregData.nextReleaseId ? statregData.nextReleaseId : ''
        }
        statisticData.push(statisticDataDashboard)
      }
    } catch (e) {
      const message: string = `Failed to prepStatistics for statistic: ${statistic.displayName} (${e})`
      log.error(message)
    }
  })
  return sortByNextRelease(statisticData)
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
    status: jobNode.data.status,
    task: jobNode.data.task,
    message: jobNode.data.message ? jobNode.data.message : '',
    result: jobResult,
    user: jobNode.data.user
  }
}

// NOTE example code to fetch event logs connected to datasources on statistics job log
// function getEventLogsFromStatisticsJobLog(connection: RepoConnection, jobLogId: string): Array<unknown> {
//   const jobLog: JobInfoNode = connection.get(jobLogId)
//   const userLogin: string | undefined = jobLog.data.user?.login
//   const from: string = jobLog.data.jobStarted
//   const to: string = jobLog.data.completionTime
//   const datasetIds: Array<string> = jobLog.data.refreshDataResult as Array<string> || []
//   return datasetIds.map((id) => {
//     log.info(`_path LIKE "/queries/${id}/*" AND data.by.login = "${userLogin}" AND range("_ts", instant("${from}"), instant("${to}"))`)
//     const eventLogsResult: NodeQueryResponse = connection.query({
//       query: `_path LIKE "/queries/${id}/*" AND data.by.login = "${userLogin}" AND range("_ts", instant("${from}"), instant("${to}"))`,
//       count: 10,
//       sort: '_ts DESC'
//     })
//     return null
//   })
// }

export function getStatistics(): Array<Content<Statistics>> {
  let hits: Array<Content<Statistics>> = []
  const result: QueryResponse<Statistics> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 1000
  })
  hits = hits.concat(result.hits)
  return hits
}

function getStatregInfo(key: string): StatregData | undefined {
  const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(key)
  if (statisticStatreg) {
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
      variantId: variant.id
    }
    return result
  }
  return undefined
}

function sortByNextRelease(statisticData: Array<StatisticDashboard>): Array<StatisticDashboard> {
  const statisticsSorted: Array<StatisticDashboard> = statisticData.sort((a, b) => {
    const dateA: Date | string = a.nextRelease ? new Date(a.nextRelease) : ''
    const dateB: Date | string = b.nextRelease ? new Date(b.nextRelease) : ''
    if (dateA < dateB) {
      return -1
    } else if (dateA > dateB) {
      return 1
    } else {
      return 0
    }
  })

  return statisticsSorted
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
  language?: string;
  name?: string;
  statisticId: string;
  shortName: string;
  frequency: string;
  variantId: string;
  nextRelease?: string;
  nextReleaseId?: string;
  relatedTables?: Array<RelatedTbml>;
  relatedUserTBMLs?: Array<OwnerWithSources>;
  aboutTheStatistics?: string;
  logData: Array<DashboardJobInfo>;
}

interface StatregData {
  statisticId: string;
  shortName: string;
  frequency: string;
  nextRelease: string;
  nextReleaseId: string;
  variantId: string;
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
  getStatistics: () => Array<Content<Statistics>>;
  getDatasetIdsFromStatistic: (statistic: Content<Statistics>) => Array<string>;
}

