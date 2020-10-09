import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/lib/content'
import { Statistic } from '../../site/mixins/statistic/statistic'
import { StatisticInListing } from './statreg/types'
import { find } from 'ramda'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')

const {
  getAllStatisticsFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    const statisticData: Array<StatisticDashboard> = prepStatistics(getStatistics())
    socket.emit('statistics-result', statisticData)
  })
}

function prepStatistics(statistics: Array<Content<Statistic>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  //const statregData: Array<StatisticInListing> | null = getAllStatisticsFromRepo()

  statistics.map((statistic: Content<Statistic>) => {
    //const statregStatistic: StatisticInListing | undefined = statregData?.find((o) => o.id === statistic._id)
    const statisticDataDashboard: StatisticDashboard = {
      id: statistic._id,
      name: statistic._name,
      nextRelease: 'Dato'
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

interface StatisticDashboard {
  id: string;
  name: string;
  nextRelease?: string;
}
