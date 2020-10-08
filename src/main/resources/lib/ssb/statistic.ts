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
  const statregData: Array<StatisticInListing> | null = getAllStatisticsFromRepo()

  statistics.map((statistic: Content<Statistic>) => {
    const statregStatistic: StatisticInListing | undefined = statregData?.find((o) => o.id === statistic._id)
    log.info('statregStatistic PrettyJSON%s',JSON.stringify(statregStatistic ,null,4));
    const statisticDataDashboard: StatisticDashboard = {
      id: statistic._id,
      name: statistic._name,
      shortName: statregStatistic?.shortName
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

// {
//   "id": 5707,
//     "shortName": "bedrifter",
//     "name": "Virksomheter",
//     "modifiedTime": "2018-11-12 08:51:59.994",
//     "variants": {
//   "frekvens": "År",
//       "previousRelease": "2020-01-09 08:00:00.0",
//       "nextRelease": "2021-01-07 08:00:00.0"
// }
// },
