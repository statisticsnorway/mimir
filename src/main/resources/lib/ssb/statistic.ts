import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { StatisticInListing, VariantInListing } from './statreg/types'
import { UtilLibrary } from '../types/util'
import { Statistics } from '../../site/content-types/statistics/statistics'
import {DashboardDatasetLib, ProcessXml} from './dataset/dashboard'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { DatasetRepoNode, RepoDatasetLib } from '../repo/dataset'
import moment = require('moment')

import { Highchart } from '../../site/content-types/highchart/highchart'
import { Table } from '../../site/content-types/table/table'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { TbprocessorLib } from './dataset/tbprocessor'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { Source, TbmlData } from '../types/xmlParser'
import { groupBy } from 'ramda'

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
  users,
  refreshDatasetHandler
}: DashboardDatasetLib = __non_webpack_require__('/lib/ssb/dataset/dashboard')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  getTbprocessor
}: TbprocessorLib = __non_webpack_require__('/lib/ssb/dataset/tbprocessor')
const {
  encrypt
}= __non_webpack_require__('/lib/cipher/cipher')

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

    const fetchPublished: boolean = data.fetchPublished === 'on'
    const processXmls: Array<ProcessXml> | undefined = !fetchPublished && data.owners ? processXmlFromOwners(data.owners) : undefined

    if (statistic) {
      const datasetIdsToUpdate: Array<string> = getDatasetIdsFromStatistic(statistic)

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
          refreshDatasetHandler(
            datasetIdsToUpdate,
            socketEmitter,
            fetchPublished ? DATASET_BRANCH : UNPUBLISHED_DATASET_BRANCH,
            processXmls
            )
        })
      }
      socketEmitter.broadcast('statistics-refresh-result', {
        id: data.id
      })
    }
  })
}

function processXmlFromOwners(owners: RefreshInfo['owners']) {
  return owners && Object.keys(owners).reduce((acc: Array<ProcessXml>, ownerKey) => {
    const ownerKeyInt: number = parseInt(ownerKey)
    const currentOwnerObj: OwnerObject | undefined = owners && owners[ownerKeyInt] ? owners[ownerKeyInt] : undefined
    const ownerTableIds: Array<string> | undefined = currentOwnerObj && Array.isArray(currentOwnerObj.ownerTableIds) ?
      currentOwnerObj.ownerTableIds : undefined

    const sourceNodesString: Array<string> | undefined = currentOwnerObj && ownerTableIds ?
      ownerTableIds.map((tableId) => {
        return `<source user="${currentOwnerObj.username}" password="${encrypt(currentOwnerObj.password)}" id="${tableId}"/>`
      }) : undefined

    if (sourceNodesString && currentOwnerObj) {
      acc.push({
        tbmlId: parseInt(currentOwnerObj.tbmlId),
        processXml: `<process>${sourceNodesString.join('')}</process>`
      })
    }
    return acc
  }, [])
}

export function getDatasetIdsFromStatistic(statistic: Content<Statistics>): Array<string> {
  const mainTableId: Array<string> = statistic.data.mainTable ? [statistic.data.mainTable] : []
  const statisticsKeyFigureId: Array<string> = statistic.data.statisticsKeyFigure ? [statistic.data.statisticsKeyFigure] : []
  const attachmentTablesFiguresIds: Array<string> = statistic.data.attachmentTablesFigures ? forceArray(statistic.data.attachmentTablesFigures) : []
  return [...mainTableId, ...statisticsKeyFigureId, ...attachmentTablesFiguresIds]
}

function sourceListFromStatistic(statistic: Content<Statistics>): Array<TbmlSources> {
  const datasetIds: Array<string> = getDatasetIdsFromStatistic(statistic)

  const datasets: Array<DatasetRepoNode<TbmlData>> = datasetIds.reduce((acc: Array<DatasetRepoNode<TbmlData>>, contentId: string) => {
    const dataset: DatasetRepoNode<TbmlData> | null = getDatasetFromContentId(contentId)
    if (dataset) acc.push(dataset)
    return acc
  }, [])

  const byOwners: Function = groupBy((source: Source) => {
    return `${source.owner}`
  })

  return datasets.map((dataset) => {
    return {
      tbmlId: dataset._name,
      sourceList: dataset.data && typeof(dataset.data) !== 'string' &&
      dataset.data.tbml.metadata && dataset.data.tbml.metadata.sourceList ?
        byOwners(forceArray(dataset.data.tbml.metadata.sourceList)) : undefined
    }
  })
}

function getDatasetFromContentId(contentId: string): DatasetRepoNode<TbmlData> | null {
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
    const statregData: StatregData | undefined = statistic.data.statistic ? getStatregInfo(statistic.data.statistic) : undefined
    const relatedTables: Array<TbmlSources> = sourceListFromStatistic(statistic)
    if (statregData && statregData.nextRelease && moment(statregData.nextRelease).isSameOrAfter(new Date(), 'day')) {
      const statisticDataDashboard: StatisticDashboard = {
        id: statistic._id,
        language: statistic.language ? statistic.language : '',
        name: statistic._name ? statistic._name : '',
        shortName: statregData.shortName,
        nextRelease: statregData.nextRelease ? statregData.nextRelease : '',
        relatedTables
      }
      statisticData.push(statisticDataDashboard)
    }
  })
  return sortByNextRelease(statisticData)
}

export function getStatistics(): Array<Content<Statistics>> {
  let hits: Array<Content<Statistics>> = []
  const result: QueryResponse<Statistics> = query({
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE "*"`,
    count: 50
  })
  hits = hits.concat(result.hits)
  return hits
}

function getStatregInfo(key: string): StatregData | undefined {
  const statisticStatreg: StatisticInListing | undefined = getStatisticByIdFromRepo(key)
  if (statisticStatreg) {
    const variants: Array<VariantInListing> = forceArray(statisticStatreg.variants)
    const variant: VariantInListing = variants[0] // TODO: Multiple variants
    const result: StatregData = {
      shortName: statisticStatreg.shortName,
      frekvens: variant.frekvens,
      previousRelease: variant.previousRelease,
      nextRelease: variant.nextRelease ? variant.nextRelease : ''
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

interface RefreshInfo {
  id: string;
  owners?: {
    [ownerKey: number]: OwnerObject;
  };
  owner: string;
  fetchPublished: 'on' | null;
}

interface OwnerObject {
  username: string;
  password: string;
  ownerTableIds?: Array<string>;
  tbmlId: string;
};

interface StatisticDashboard {
  id: string;
  language?: string;
  name?: string;
  shortName: string;
  nextRelease?: string;
  relatedTables?: Array<TbmlSources>;
}

interface StatregData {
  shortName: string;
  frekvens: string;
  previousRelease: string;
  nextRelease: string;
}

interface TbmlSources {
  tbmlId: string;
  sourceList?: {
    [key: number]: Array<Source>;
  };
}

export interface StatisticLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
  getStatistics: () => Array<Content<Statistics>>;
  getDatasetIdsFromStatistic: (statistic: Content<Statistics>) => Array<string>;
}

export interface GroupByResult {
  [key: number]: Array<object>;
}
