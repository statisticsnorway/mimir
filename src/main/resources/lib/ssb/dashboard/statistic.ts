import type { Default as DefaultPageConfig } from '/site/pages/default'

__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { EventInfo } from '/lib/ssb/repo/query'
import { Socket, SocketEmitter } from '/lib/types/socket'
import { query, get as getContent, Content, ContentsResult } from '/lib/xp/content'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import type { Statistics, Highchart, Table, KeyFigure } from '/site/content-types'
import { ProcessXml, RefreshDatasetResult, DashboardJobInfo } from '/lib/ssb/dashboard/dashboard'
import { run, type ContextParams } from '/lib/xp/context'
import { sanitize } from '/lib/xp/common'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import type { DataSource } from '/site/mixins/dataSource'
import { Source, TbmlDataUniform } from '/lib/types/xmlParser'
import { JobEventNode, JobInfoNode, JobNames, JobStatus } from '/lib/ssb/repo/job'
import { hasRole, User } from '/lib/xp/auth'
import type { Statistic } from '/site/mixins/statistic'

const { hasWritePermissions } = __non_webpack_require__('/lib/ssb/parts/permissions')
const { fetchStatisticsWithRelease, getAllStatisticsFromRepo, getStatisticByIdFromRepo } =
  __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { refreshDatasetHandler } = __non_webpack_require__('/lib/ssb/dashboard/dashboard')
const { users } = __non_webpack_require__('/lib/ssb/dashboard/dashboardUtils')
const { getTbprocessor, getTbprocessorKey } = __non_webpack_require__('/lib/ssb/dataset/tbprocessor/tbprocessor')
const { encrypt } = __non_webpack_require__('/lib/cipher/cipher')
const { completeJobLog, updateJobLog, startJobLog } = __non_webpack_require__('/lib/ssb/repo/job')
const { withConnection, ENONIC_CMS_DEFAULT_REPO, getNode, queryNodes } = __non_webpack_require__('/lib/ssb/repo/common')
const { EVENT_LOG_BRANCH, EVENT_LOG_REPO } = __non_webpack_require__('/lib/ssb/repo/eventLog')
const { localize } = __non_webpack_require__('/lib/xp/i18n')
const { executeFunction } = __non_webpack_require__('/lib/xp/task')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    executeFunction({
      description: 'get-statistics',
      func: () => {
        const context: ContextParams = {
          branch: 'master',
          repository: ENONIC_CMS_DEFAULT_REPO,
          // principals: ['role:system.admin'],
          user: {
            login: users[parseInt(socket.id)].login,
            idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system',
          },
        }
        const statisticData: Array<StatisticDashboard> = run(context, () => getStatistics())
        socket.emit('statistics-result', statisticData)
      },
    })
  })

  socket.on('get-statistics-search-list', () => {
    executeFunction({
      description: 'get-statistics-search-list',
      func: () => {
        const statisticsSearchData: Array<StatisticSearch> = getStatisticsSearchList()
        socket.emit('statistics-search-list-result', statisticsSearchData)
      },
    })
  })

  socket.on('get-statistics-owners-with-sources', (options: GetSourceListOwnersOptions) => {
    executeFunction({
      description: 'get-statistics-owners-with-sources',
      func: () => {
        const ownersWithSources: Array<OwnerWithSources> = getOwnersWithSources(options.dataSourceIds)
        socket.emit('statistics-owners-with-sources-result', {
          id: options.id,
          ownersWithSources,
        })
      },
    })
  })

  socket.on('get-statistics-job-log', (options: GenericIdParam) => {
    executeFunction({
      description: 'get-statistics-job-log',
      func: () => {
        const jobLogs: Array<object> = getStatisticsJobLogInfo(options.id, 10)
        socket.emit('get-statistics-job-log-result', {
          id: options.id,
          jobLogs,
        })
      },
    })
  })

  socket.on('get-statistic-job-log-details', (options: { id: string; statisticId: string }) => {
    executeFunction({
      description: 'get-statistic-job-log-details',
      func: () => {
        const logDetails: { user: User; dataset: Array<object> } | undefined = getEventLogsFromStatisticsJobLog(
          options.id
        )
        socket.emit('get-statistic-job-log-details-result', {
          id: options.statisticId,
          user: logDetails && logDetails.user ? logDetails.user : '',
          logs: {
            jobId: options.id,
            logDetails: logDetails && logDetails.dataset ? logDetails.dataset : [],
          },
        })
      },
    })
  })

  socket.on('get-statistics-related-tables-and-owners-with-sources', (options: GetRelatedTablesOptions) => {
    executeFunction({
      description: 'get-statistics-related-tables-and-owners-with-sources',
      func: () => {
        const statistic: Content<Statistics> | null = getContent({
          key: options.id,
        })
        let relatedTables: Array<RelatedTbml> = []
        if (statistic) {
          relatedTables = getRelatedTables(statistic)
        }
        const ownersWithSources: Array<OwnerWithSources> = getOwnersWithSources(relatedTables.map((t) => t.queryId))
        socket.emit('statistics-related-tables-and-owners-with-sources-result', {
          id: options.id,
          relatedTables,
          ownersWithSources,
        })
      },
    })
  })

  socket.on('refresh-statistic', (data: RefreshInfo) => {
    executeFunction({
      description: 'refresh-statistic',
      func: () => {
        socketEmitter.broadcast('statistics-activity-refresh-started', {
          id: data.id,
        })
        const statistic: Content<Statistics> | null = getContent({
          key: data.id,
        })

        if (statistic) {
          const datasetIdsToUpdate: Array<string> = getDataSourceIdsFromStatistics(statistic)
          const processXmls: Array<ProcessXml> | undefined = data.owners ? processXmlFromOwners(data.owners) : undefined
          if (datasetIdsToUpdate.length > 0) {
            const context: ContextParams = {
              branch: 'master',
              repository: ENONIC_CMS_DEFAULT_REPO,
              principals: ['role:system.admin'],
              user: {
                login: users[parseInt(socket.id)].login,
                idProvider: users[parseInt(socket.id)].idProvider ? users[parseInt(socket.id)].idProvider : 'system',
              },
            }
            run(context, () => {
              const jobLogNode: JobEventNode = startJobLog(JobNames.STATISTICS_REFRESH_JOB)
              updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
                node.data.queryIds = [data.id]
                return node
              })
              const feedbackEventName = 'statistics-activity-refresh-feedback'
              const relatedStatisticsId: string = data.id
              const refreshDataResult: Array<RefreshDatasetResult> = refreshDatasetHandler(
                datasetIdsToUpdate,
                socketEmitter,
                processXmls,
                feedbackEventName,
                relatedStatisticsId
              )
              const finishedJobLog: JobInfoNode = completeJobLog(jobLogNode._id, JobStatus.COMPLETE, refreshDataResult)
              socketEmitter.broadcast('statistics-refresh-result-log', {
                id: data.id,
                log: prepStatisticsJobLogInfo(finishedJobLog),
              })
            })
          }
          socketEmitter.broadcast('statistics-refresh-result', {
            id: data.id,
          })
        }
        socketEmitter.broadcast('statistics-activity-refresh-complete', {
          id: data.id,
          status: 'complete',
        })
      },
    })
  })
}

function processXmlFromOwners(owners: Array<OwnerObject>): Array<ProcessXml> {
  const preRender: Array<SourceNodeRender> = owners.reduce((acc: Array<SourceNodeRender>, ownerObj: OwnerObject) => {
    // if the fetchPublished is set to on, do not create process xml
    // Only requests with xml will try to fetch unpublished data
    !ownerObj.fetchPublished &&
      ownerObj.tbmlList &&
      ownerObj.tbmlList.forEach((tbmlIdObj: Tbml) => {
        const tbmlProcess: SourceNodeRender | undefined = acc.find(
          (process: SourceNodeRender) => process.tbmlId.toString() === tbmlIdObj.tbmlId.toString()
        )
        if (tbmlProcess) {
          tbmlIdObj.sourceTableIds.forEach((sourceTable) => {
            tbmlProcess.sourceNodeStrings.push(
              `<source user="${ownerObj.username}" password="${encrypt(ownerObj.password)}" id="${sourceTable}"/>`
            )
          })
        } else {
          acc.push({
            tbmlId: tbmlIdObj.tbmlId.toString(),
            sourceNodeStrings: tbmlIdObj.sourceTableIds.map((sourceTable) => {
              return `<source user="${ownerObj.username}" password="${encrypt(
                ownerObj.password
              )}" id="${sourceTable}"/>`
            }),
          })
        }
      })
    return acc
  }, [])

  return preRender.map((sourceNode) => ({
    tbmlId: sourceNode.tbmlId.toString(),
    processXml: `<process>${sourceNode.sourceNodeStrings.join('')}</process>`,
  }))
}

export function getDataSourceIdsFromStatistics(statistic: Content<Statistics>): Array<string> {
  const mainTableId: Array<string> = statistic.data.mainTable ? [statistic.data.mainTable] : []
  const statisticsKeyFigureId: Array<string> = statistic.data.statisticsKeyFigure
    ? [statistic.data.statisticsKeyFigure]
    : []
  const attachmentTablesFiguresIds: Array<string> = statistic.data.attachmentTablesFigures
    ? forceArray(statistic.data.attachmentTablesFigures)
    : []
  return [...mainTableId, ...statisticsKeyFigureId, ...attachmentTablesFiguresIds]
}

function getSourcesForUserFromStatistic(sources: Array<SourceList>): Array<OwnerWithSources> {
  return sources.reduce((acc: Array<OwnerWithSources>, source: SourceList) => {
    const { dataset } = source

    if (
      dataset.data &&
      typeof dataset.data !== 'string' &&
      dataset.data.tbml.metadata &&
      dataset.data.tbml.metadata.sourceList
    ) {
      const tbmlId: string = dataset.data.tbml.metadata.instance.definitionId.toString()
      forceArray(dataset.data.tbml.metadata.sourceList).forEach((source: Source) => {
        const userIndex: number = acc.findIndex((it) => it.ownerId == source.owner)
        if (userIndex != -1) {
          const tbmlIndex: number = acc[userIndex].tbmlList.findIndex((it) => it.tbmlId == tbmlId)
          if (tbmlIndex == -1) {
            acc[userIndex].tbmlList.push({
              tbmlId: tbmlId,
              sourceTableIds: [source.id.toString()],
              statbankTableIds: [source.tableId.toString()],
            })
          } else {
            acc[userIndex].tbmlList[tbmlIndex].sourceTableIds.push(source.id.toString())
            acc[userIndex].tbmlList[tbmlIndex].statbankTableIds.push(source.tableId.toString())
          }
        } else {
          acc.push({
            ownerId: source.owner.toString(),
            tbmlList: [
              {
                tbmlId: tbmlId,
                sourceTableIds: [source.id.toString()],
                statbankTableIds: [source.tableId.toString()],
              },
            ],
          })
        }
      })
    }
    return acc
  }, [])
}

function getDatasetFromContentId(contentId: string): DatasetRepoNode<TbmlDataUniform> | null {
  const queryResult: ContentsResult<Content<DataSource>> = query({
    query: `_id = '${contentId}'`,
    count: 1,
    filters: {
      exists: {
        field: 'data.dataSource.tbprocessor.urlOrId',
      },
    },
  })

  const content = queryResult.count === 1 ? queryResult.hits[0] : undefined
  return content ? getTbprocessor(content, 'master') : null
}

function getOwnersWithSources(dataSourceIds: Array<string>): Array<OwnerWithSources> {
  const datasets: Array<SourceList> = dataSourceIds.reduce((acc: Array<SourceList>, contentId: string) => {
    const dataset: DatasetRepoNode<TbmlDataUniform> | null = getDatasetFromContentId(contentId)
    if (dataset) {
      acc.push({
        dataset,
        queryId: contentId,
      })
    }
    return acc
  }, [])
  return getSourcesForUserFromStatistic(datasets)
}

function getStatisticsJobLogInfo(id: string, count = 1): Array<DashboardJobInfo> {
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (connection) => {
    // deepcode ignore Sqli: queryIds are sanitized
    const statisticsJobLog = connection.query({
      query: `_path LIKE "/jobs/*" AND data.task = "${JobNames.STATISTICS_REFRESH_JOB}" AND data.queryIds = "${sanitize(
        id
      )}"`,
      count,
      sort: '_ts DESC',
    })
    return statisticsJobLog.hits.reduce((res: Array<DashboardJobInfo>, jobRes) => {
      const jobNode: JobInfoNode | null = connection.get(sanitize(jobRes.id))
      if (jobNode) {
        res.push(prepStatisticsJobLogInfo(jobNode))
      }
      return res
    }, [])
  })
}

function prepStatisticsJobLogInfo(jobNode: JobInfoNode): DashboardJobInfo {
  const jobResult: Array<RefreshDatasetResult> = forceArray(
    jobNode.data.refreshDataResult || []
  ) as Array<RefreshDatasetResult>
  jobResult.forEach((datasetResult: RefreshDatasetResult) => {
    datasetResult.status = localize({
      key: datasetResult.status,
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
    user: jobNode.data.user,
  }
}

// NOTE example code to fetch event logs connected to datasources on statistics job log
function getEventLogsFromStatisticsJobLog(jobLogId: string): { user: User; dataset: Array<object> } | undefined {
  const jobInfoNode: JobInfoNode | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/jobs/${jobLogId}`) as JobInfoNode
  if (!jobInfoNode) {
    return undefined
  }
  if (!jobInfoNode.data.refreshDataResult) {
    return {
      user: jobInfoNode.data.user,
      dataset: [],
    }
  }
  const userLogin: string | undefined = jobInfoNode.data.user?.login
  const from: string = jobInfoNode.data.jobStarted
  const to: string = jobInfoNode.data.completionTime
  const datasets: Array<RefreshDatasetResult> =
    (forceArray(jobInfoNode.data.refreshDataResult) as Array<RefreshDatasetResult>) || []
  return {
    user: jobInfoNode.data.user,
    dataset: datasets.map((dataset) => {
      const datasetContent: Content<Highchart | Table | KeyFigure> | null = getContent({
        key: dataset.id,
      })
      const eventLogResult = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
        query: `_path LIKE "/queries/${dataset.id}/*" AND data.by.login = "${userLogin}" AND range("_ts", instant("${from}"), instant("${to}"))`,
        count: 10,
        sort: '_ts DESC',
      })
      return {
        displayName: datasetContent?.displayName,
        branch: dataset.branch === 'master' ? 'publisert' : 'upublisert',
        eventLogResult: eventLogResult.hits.map((hit) => {
          const node = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataset.id}/${hit.id}`) as EventInfo | null
          if (!node) return {}

          const resultMessage: string = localize({
            key: node.data.status.message,
            values: node.data.status.status ? [`(${node.data.status.status})`] : [''],
          })
          return {
            result: resultMessage !== 'NOT_TRANSLATED' ? resultMessage : node.data.status.message,
            modifiedTs: node.data.ts,
            by: node.data.by && node.data.by.displayName ? node.data.by.displayName : '',
          }
        }),
      }
    }),
  }
}

function checkIfUserIsAdmin(): boolean {
  return hasRole('system.admin')
}

const ONE_MONTH = 31 // TODO: put in config?
function getStatistics(): Array<StatisticDashboard> {
  const userIsAdmin: boolean = checkIfUserIsAdmin()
  const statistic: Array<StatisticDashboard> = userIsAdmin ? getAdminStatistics() : getUserStatistics()
  return statistic.sort((a, b) => {
    return new Date(a.nextRelease || '01.01.3000').getTime() - new Date(b.nextRelease || '01.01.3000').getTime()
  })
}

function getAdminStatistics(): Array<StatisticDashboard> {
  const statsBeforeDate: Date = new Date()
  statsBeforeDate.setDate(statsBeforeDate.getDate() + ONE_MONTH)
  const statregStatistics: Array<StatisticInListing> = fetchStatisticsWithRelease(statsBeforeDate)
  const statisticsContent: Array<Content<Statistics>> = query({
    query: `data.statistic IN(${statregStatistics.map((s) => `"${s.id}"`).join(',')})`,
    count: 1000,
  }).hits as unknown as Array<Content<Statistics>>
  return statisticsContent.map((statisticContent) => prepDashboardStatistics(statisticContent, statregStatistics))
}

function getUserStatistics(): Array<StatisticDashboard> {
  const userStatisticsResult: ContentsResult<Content<Statistics & DefaultPageConfig>> = query({
    query: `data.statistic LIKE '*'`,
    contentTypes: [`${app.name}:statistics`],
    count: 1000,
  })
  const userStatisticContent: Array<Content<Statistics & Statistic>> = userStatisticsResult.hits.filter(
    (statistic: Content<Statistics>) => hasWritePermissions(statistic._id)
  )
  const userStatistic: Array<StatisticInListing> = userStatisticContent.reduce(
    (acc: Array<StatisticInListing>, statistic) => {
      if (statistic.data.statistic) {
        const resultFromRepo: StatisticInListing | undefined = getStatisticByIdFromRepo(statistic.data.statistic)
        if (resultFromRepo) acc.push(resultFromRepo)
      }
      return acc
    },
    []
  )
  return userStatisticContent.map((statisticContent) => prepDashboardStatistics(statisticContent, userStatistic))
}

function prepDashboardStatistics(
  statisticContent: Content<Statistics & Statistic>,
  statregStatistics: Array<StatisticInListing>
): StatisticDashboard {
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
    status: statregData.status,
    variantId: statregData.variantId,
    nextRelease: statregData.nextRelease,
    nextReleaseId: statregData.nextReleaseId,
    activeVariants: statregData.activeVariants,
    ownersWithSources: undefined,
    relatedTables: relatedTables,
    aboutTheStatistics: statisticContent.data.aboutTheStatistics,
    logData: getStatisticsJobLogInfo(statisticContent._id),
    previewUrl: statisticContent._path ? `${prefix}/site/preview/default/draft${statisticContent._path}` : '',
  }
}

function getRelatedTables(statistic: Content<Statistics>): Array<RelatedTbml> {
  const dataSourceIds: Array<string> = getDataSourceIdsFromStatistics(statistic)
  const dataSources: Array<Content<DataSource>> = query({
    count: dataSourceIds.length,
    query: 'data.dataSource._selected = "tbprocessor" AND data.dataSource.tbprocessor.urlOrId LIKE "*"',
    filters: {
      ids: {
        values: dataSourceIds,
      },
    },
  }).hits as unknown as Array<Content<DataSource>>
  const relatedTables: Array<RelatedTbml> = dataSources.map((dataSource) => {
    return {
      queryId: dataSource._id,
      tbmlId: getTbprocessorKey(dataSource),
    }
  })

  return relatedTables
}

function getStatregInfo(statisticStatreg: StatisticInListing | undefined): StatregData {
  if (!statisticStatreg) {
    return {
      statisticId: -1,
      shortName: '',
      status: '',
      frequency: '',
      nextRelease: '',
      nextReleaseId: '',
      variantId: '',
      activeVariants: -1,
    }
  }
  const variants: Array<VariantInListing> = statisticStatreg.variants
    ? forceArray(statisticStatreg.variants).sort((a: VariantInListing, b: VariantInListing) => {
        const aDate: Date = a.nextRelease ? new Date(a.nextRelease) : new Date('01.01.3000')
        const bDate: Date = b.nextRelease ? new Date(b.nextRelease) : new Date('01.01.3000')
        return aDate.getTime() - bDate.getTime()
      })
    : []
  const variant: VariantInListing = variants[0]
  const result: StatregData = {
    statisticId: statisticStatreg.id,
    shortName: statisticStatreg.shortName,
    status: statisticStatreg.status ? statisticStatreg.status : 'A',
    frequency: variant && variant.frekvens ? variant.frekvens : '',
    nextRelease: variant && variant.nextRelease ? variant.nextRelease : '',
    nextReleaseId: variant && variant.nextReleaseId ? variant.nextReleaseId : '',
    variantId: variant ? variant.id : '',
    activeVariants: variants.length,
  }
  return result
}

function getStatisticsSearchList(): Array<StatisticSearch> {
  const statregStatistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const statisticsContent: Array<Content<Statistics & Statistic>> = getStatisticsContent()
  return statisticsContent.map((statistics) => {
    const statregData: StatisticInListing | undefined = statregStatistics.find((s) => {
      return `${s.id}` === statistics.data.statistic
    })
    return {
      id: statistics._id,
      name: statistics.displayName,
      shortName: statregData?.shortName || '',
    }
  })
}

export function getStatisticsContent(): Array<Content<Statistics>> {
  let hits: Array<Content<Statistics>> = []
  const result: ContentsResult<Content<Statistics & DefaultPageConfig>> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 1000,
  })
  hits = hits.concat(result.hits)
  return hits
}

interface SourceNodeRender {
  tbmlId: string
  sourceNodeStrings: Array<string>
}

interface SourceList {
  queryId: string
  dataset: DatasetRepoNode<TbmlDataUniform>
}

interface RefreshInfo {
  id: string
  owners?: Array<OwnerObject>
}

interface GetSourceListOwnersOptions {
  id: string
  dataSourceIds: Array<string>
}

interface GetRelatedTablesOptions {
  id: string
}

interface GenericIdParam {
  id: string
}

interface OwnerObject {
  username: string
  password: string
  tbmlList?: Array<Tbml>
  ownerId: string
  tbmlId: string
  fetchPublished: true | undefined
}

interface StatisticDashboard {
  id: string
  previewUrl?: string
  language?: string
  name?: string
  statisticId: number
  shortName: string
  frequency: string
  status: string
  variantId: string
  nextRelease: string
  nextReleaseId: string
  activeVariants: number
  relatedTables?: Array<RelatedTbml>
  ownersWithSources?: Array<OwnerWithSources>
  aboutTheStatistics?: string
  logData: Array<DashboardJobInfo>
}

interface StatisticSearch {
  id: string
  shortName: string
  name: string
}

interface StatregData {
  statisticId: number
  shortName: string
  status: string
  frequency: string
  nextRelease: string
  nextReleaseId: string
  variantId: string
  activeVariants: number
}

interface RelatedTbml {
  queryId: string
  tbmlId: string
}

interface OwnerWithSources {
  ownerId: string
  tbmlList: Array<Tbml>
}

interface Tbml {
  tbmlId: string
  sourceTableIds: Array<string>
  statbankTableIds: Array<string>
}

export interface StatisticLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void
  getDataSourceIdsFromStatistics: (statistic: Content<Statistics>) => Array<string>
  getStatisticsContent: () => Array<Content<Statistics>>
}
