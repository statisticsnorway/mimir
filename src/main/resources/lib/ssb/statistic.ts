import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/lib/content'
import { Statistic } from '../../site/mixins/statistic/statistic'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    const statisticData: Array<StatisticDashboard> = prepStatistics(getStatistics())
    socket.emit('statistics-result', statisticData)
  })
}

function prepStatistics(statistics: Array<Content<Statistic>>): Array<StatisticDashboard> {
  const statisticData: Array<StatisticDashboard> = []
  statistics.map((statistic: Content<Statistic>) => {
    const statisticDataDashboard: StatisticDashboard = {
      id: statistic._id,
      name: statistic._name,
      shortName: statistic.data.statistic
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
  shortName?: string;
}
