import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/lib/content'
import { StatisticInListing } from './statreg/types'
import { UtilLibrary } from '../types/util'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    const statisticData: Array<StatisticDashboard> = prepStatistics(getStatistics())
    socket.emit('statistics-result', statisticData)
  })
}

function prepStatistics(statistics: Array<Content<Statistic>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  statistics.map((statistic: Content<Statistic>) => {
    const name: string = statistic.language === 'en' ? 'Engelsk: ' + statistic._name : statistic._name
    const statregData: StatregData | undefined = statistic.data.statistic? getStatregInfo(statistic.data.statistic) : undefined
    let nextRelease = ''
    if (statregData) {
      nextRelease = statregData.nextRelease
    }
    const statisticDataDashboard: StatisticDashboard = {
      id: statistic._id,
      name: name,
      nextRelease: nextRelease
    }
    statisticData.push(statisticDataDashboard)
  })
  return statisticData
}

function getStatistics(): Array<Content<Statistic>> {
  let hits: Array<Content<Statistic>> = []
  const result: QueryResponse<Statistic> = query({
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
    const variants = util.data.forceArray(statisticStatreg.variants)
    const variant = variants[0] //TODO: Multiple variants 
    const result: StatregData = {
      shortName: statisticStatreg.shortName,
      frekvens: variant.frekvens,
      previousRelease: variant.previousRelease,
      nextRelease: variant.nextRelease ? variant.nextRelease : '',
    }
    return result
  }
  return undefined
}

interface StatisticDashboard {
  id: string;
  name: string;
  nextRelease?: string;
}

interface Statistic {
  statistic?: string;
  language: string;
}

interface StatregData {
  shortName: string;
  frekvens: string;
  previousRelease: string;
  nextRelease: string;
}