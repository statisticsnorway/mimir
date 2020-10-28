import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { StatisticInListing, VariantInListing } from './statreg/types'
import { UtilLibrary } from '../types/util'
import { Statistics } from '../../site/content-types/statistics/statistics'
import { DashboardDatasetLib } from './dataset/dashboard'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { RepoDatasetLib } from '../repo/dataset'

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
      const datasetIdsToUpdate: Array<string> = getDatasetFromStatistics(statistic)
      if (datasetIdsToUpdate.length > 0) {
        const context: RunContext = {
          branch: 'master',
          repository: 'com.enonic.cms.default',
          principals: ['role:system.admin'],
          user: {
            login: users[parseInt(socket.id)].user,
            idProvider: users[parseInt(socket.id)].store ? users[parseInt(socket.id)].store : 'system'
          }
        }
        run(context, () => {
          refreshDatasetHandler(datasetIdsToUpdate, socketEmitter, data.fetchPublished ? DATASET_BRANCH : UNPUBLISHED_DATASET_BRANCH)
        })
      }
      socketEmitter.broadcast('statistics-refresh-result', {
        id: data.id
      })
    }
  })
}

function prepStatistics(statistics: Array<Content<Statistics>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  statistics.map((statistic: Content<Statistics>) => {
    const statregData: StatregData | undefined = statistic.data.statistic ? getStatregInfo(statistic.data.statistic) : undefined
    if (statregData && statregData.nextRelease) {
      const statisticDataDashboard: StatisticDashboard = {
        id: statistic._id,
        language: statistic.language ? statistic.language : '',
        name: statistic._name ? statistic._name : '',
        shortName: statregData.shortName,
        nextRelease: statregData.nextRelease ? statregData.nextRelease : ''
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

export function getDatasetFromStatistics(statistic: Content<Statistics>): Array<string> {
  let datasetIds: Array<string> = []
  if (statistic.data.mainTable) {
    datasetIds.push(statistic.data.mainTable)
  }
  if (statistic.data.statisticsKeyFigure) {
    datasetIds.push(statistic.data.statisticsKeyFigure)
  }
  if (statistic.data.attachmentTablesFigures) {
    datasetIds = datasetIds.concat(datasetIds, forceArray(statistic.data.attachmentTablesFigures))
  }

  return datasetIds
}

interface RefreshInfo {
  id: string;
  fetchPublished: boolean;
}

interface StatisticDashboard {
  id: string;
  language?: string;
  name?: string;
  shortName: string;
  nextRelease?: string;
}

interface StatregData {
  shortName: string;
  frekvens: string;
  previousRelease: string;
  nextRelease: string;
}

export interface StatisticLib {
  setupHandlers: (socket: Socket, socketEmitter: SocketEmitter) => void;
  getStatistics: () => Array<Content<Statistics>>;
  getDatasetFromStatistics: (statistic: Content<Statistics>) => Array<string>;
}
