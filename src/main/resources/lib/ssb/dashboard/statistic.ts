import '/lib/ssb/polyfills/nashorn'

import { type components } from '@statisticsnorway/statreg-api-types'
import { query, get as getContent, Content, ContentsResult } from '/lib/xp/content'
import { run, type ContextParams } from '/lib/xp/context'
import { sanitize } from '/lib/xp/common'
import { hasRole, User } from '/lib/xp/auth'

import { localize } from '/lib/xp/i18n'
import { executeFunction } from '/lib/xp/task'
import { encrypt } from '/lib/cipher/cipher'
import * as util from '/lib/util'
import { type Source, type TbmlDataUniform } from '/lib/types/xmlParser'
import { type Socket, type SocketEmitter } from '/lib/wsUtil'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO } from '/lib/ssb/repo/eventLog'
import { withConnection, ENONIC_CMS_DEFAULT_REPO, getNode, queryNodes } from '/lib/ssb/repo/common'
import { getTbprocessor, getTbprocessorKey } from '/lib/ssb/dataset/tbprocessor/tbprocessor'
import { users } from '/lib/ssb/dashboard/dashboardUtils'
import { isEnabled } from '/lib/featureToggle'
import {
  fetchReleasesFromStatregApi,
  fetchStatisticsWithRelease,
  getAllStatisticsFromRepo,
  getStatisticByIdFromRepo,
} from '/lib/ssb/statreg/statistics'
import { hasWritePermissions } from '/lib/ssb/parts/permissions'
import {
  JobEventNode,
  JobInfoNode,
  JobNames,
  JobStatus,
  completeJobLog,
  updateJobLog,
  startJobLog,
} from '/lib/ssb/repo/job'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { ProcessXml, RefreshDatasetResult, DashboardJobInfo, refreshDatasetHandler } from '/lib/ssb/dashboard/dashboard'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { EventInfo } from '/lib/ssb/repo/query'
import { type Default as DefaultPageConfig } from '/site/pages/default'
import { type Statistic } from '/site/mixins/statistic'
import { type DataSource } from '/site/mixins/dataSource'
import { type Statistics, type Highchart, type Table, type KeyFigure } from '/site/content-types'

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
    ? util.data.forceArray(statistic.data.attachmentTablesFigures)
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
      util.data.forceArray(dataset.data.tbml.metadata.sourceList).forEach((source: Source) => {
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
    // deepcode ignore Sqli: NoQL. query is an xp function that queries one or across repositories in xp
    const statisticsJobLog = connection.query({
      query: `_path LIKE "/jobs/*" AND data.task = "${JobNames.STATISTICS_REFRESH_JOB}" AND data.queryIds = "${sanitize(
        id
      )}"`,
      count,
      sort: '_ts DESC',
    })
    return statisticsJobLog.hits.reduce((res: Array<DashboardJobInfo>, jobRes) => {
      // deepcode ignore Sqli: NoQL. get is an xp function that fetches content from the repositories in xp
      const jobNode: JobInfoNode | null = connection.get(sanitize(jobRes.id))
      if (jobNode) {
        res.push(prepStatisticsJobLogInfo(jobNode))
      }
      return res
    }, [])
  })
}

function prepStatisticsJobLogInfo(jobNode: JobInfoNode): DashboardJobInfo {
  const jobResult: Array<RefreshDatasetResult> = util.data.forceArray(
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
    (util.data.forceArray(jobInfoNode.data.refreshDataResult) as Array<RefreshDatasetResult>) || []
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
// New Statreg frontend host for Meld/Endre.
const STATREG_FRONTEND_URL: string =
  app.config?.['ssb.statreg.frontend.baseUrl'] || 'https://statistikkregisteret.intern.ssb.no'

function getStatistics(): Array<StatisticDashboard> {
  const userIsAdmin: boolean = checkIfUserIsAdmin()
  const statistic: Array<StatisticDashboard> = userIsAdmin ? getAdminStatistics() : getUserStatistics()
  // Meld → /statistikk/{kortnavn}. Endre → /publisering/{id}/rediger.
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    statistic.forEach((stat) => {
      if (stat.shortName) {
        const statisticPage = `${STATREG_FRONTEND_URL}/statistikk/${stat.shortName}`
        stat.statisticUrl = statisticPage
        if (stat.nextReleaseId) {
          stat.editReleaseUrl = `${STATREG_FRONTEND_URL}/publisering/${stat.nextReleaseId}/rediger`
        }
      }
    })
  }
  return statistic.sort((a, b) => {
    return new Date(a.nextRelease || '01.01.3000').getTime() - new Date(b.nextRelease || '01.01.3000').getTime()
  })
}

// Today through +31 days.
function getUpcomingReleaseWindow(): Date {
  const statsBeforeDate: Date = new Date()
  statsBeforeDate.setDate(statsBeforeDate.getDate() + ONE_MONTH)
  return statsBeforeDate
}

function getAdminStatistics(): Array<StatisticDashboard> {
  const statsBeforeDate: Date = getUpcomingReleaseWindow()
  // Live /releases calendar; on fail use the old repo path below.
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const fromApi: Array<StatisticDashboard> | undefined = getDashboardStatisticsFromApi(statsBeforeDate)
    if (fromApi) return fromApi
  }

  const statregStatistics: Array<StatisticInListing> = fetchStatisticsWithRelease(statsBeforeDate)
  const statisticsContent: Array<Content<Statistics>> = query({
    query: `data.statistic IN(${statregStatistics.map((s) => `"${s.id}"`).join(',')})`,
    count: 1000,
  }).hits as unknown as Array<Content<Statistics>>
  return statisticsContent.map((statisticContent) =>
    prepDashboardStatistics(statisticContent, getStatregInfoById(statisticContent, statregStatistics))
  )
}

function getUserStatistics(): Array<StatisticDashboard> {
  // Same /releases calendar as admin, then keep only pages this user can edit.
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const fromApi: Array<StatisticDashboard> | undefined = getDashboardStatisticsFromApi(
      getUpcomingReleaseWindow(),
      true
    )
    if (fromApi) return fromApi
  }

  const userStatisticContent: Array<Content<Statistics & Statistic>> =
    getUserStatisticsContent(`data.statistic LIKE '*'`)
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
  return userStatisticContent.map((statisticContent) =>
    prepDashboardStatistics(statisticContent, getStatregInfoById(statisticContent, userStatistic))
  )
}

// Enonic statistics the user may MODIFY (toggle-off user list).
function getUserStatisticsContent(statisticQuery: string): Array<Content<Statistics & Statistic>> {
  const userStatisticsResult: ContentsResult<Content<Statistics & DefaultPageConfig>> = query({
    query: statisticQuery,
    contentTypes: [`${app.name}:statistics`],
    count: 1000,
  })
  return userStatisticsResult.hits.filter((statistic: Content<Statistics>) => hasWritePermissions(statistic._id))
}

// Join Statreg kortnavn to Enonic pages. onlyWritable = non-admin write filter.
function getDashboardStatisticsFromApi(before: Date, onlyWritable = false): Array<StatisticDashboard> | undefined {
  const statregData: Record<string, StatregData> | undefined = getStatregDataFromApi(before)
  if (!statregData) return undefined

  const shortnames: Array<string> = Object.keys(statregData)
  if (shortnames.length === 0) return []

  let statisticsContent: Array<Content<Statistics>> = query({
    contentTypes: [`${app.name}:statistics`],
    count: 1000,
    filters: { hasValue: { field: 'data.shortname', values: shortnames } },
  }).hits as unknown as Array<Content<Statistics>>

  if (onlyWritable) {
    statisticsContent = statisticsContent.filter((statisticContent) => hasWritePermissions(statisticContent._id))
  }

  return statisticsContent.map((statisticContent) =>
    prepDashboardStatistics(
      statisticContent,
      statregData[statisticContent.data.shortname ?? ''] || getStatregInfo(undefined)
    )
  )
}

// GODKJENT /releases today..before, first per kortnavn. Fail → undefined (repo fallback).
function getStatregDataFromApi(before: Date): Record<string, StatregData> | undefined {
  const releases = fetchReleasesFromStatregApi({
    start: 0,
    count: 1000,
    sort: 'publish_time',
    approval_status: 'GODKJENT',
    publish_time_after: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    publish_time_before: before.toISOString(),
  })
  if (!releases || 'error' in releases || !Array.isArray(releases)) return undefined

  return releases.reduce((statregData: Record<string, StatregData>, release) => {
    const shortname: string | undefined = release.statistic?.shortname
    if (shortname && !statregData[shortname]) {
      statregData[shortname] = getStatregDataFromRelease(shortname, release)
    }
    return statregData
  }, {})
}

// kortnavn, publish_time and release id from one API row.
function getStatregDataFromRelease(shortname: string, release: components['schemas']['Release_listing']): StatregData {
  const releaseId: string = release.id?.toString() ?? ''
  return {
    statisticId: release.statistic?.id ?? -1,
    shortName: shortname,
    status: 'A',
    frequency: release.frequency?.name ?? '',
    nextRelease: release.publish_time ?? '',
    nextReleaseId: releaseId,
    variantId: '',
    activeVariants: -1,
  }
}

// Old path: match Enonic data.statistic to repo listing id.
function getStatregInfoById(
  statisticContent: Content<Statistics & Statistic>,
  statregStatistics: Array<StatisticInListing>
): StatregData {
  const statregStat = statregStatistics.find((stat) => `${stat.id}` === statisticContent.data.statistic)
  return getStatregInfo(statregStat)
}

function prepDashboardStatistics(
  statisticContent: Content<Statistics & Statistic>,
  statregData: StatregData = getStatregInfo(undefined)
): StatisticDashboard {
  const prefix: string = app.config && app.config['admin-prefix'] ? app.config['admin-prefix'] : '/xp/admin'
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
    editReleaseUrl: statregData.editReleaseUrl,
    statisticUrl: statregData.statisticUrl,
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
    ? util.data.forceArray(statisticStatreg.variants).sort((a: VariantInListing, b: VariantInListing) => {
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
  editReleaseUrl?: string
  statisticUrl?: string
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
  editReleaseUrl?: string
  statisticUrl?: string
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
