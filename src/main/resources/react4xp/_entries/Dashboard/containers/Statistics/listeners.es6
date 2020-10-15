import { actions } from './slice'

export default function setupStatisticsListeners(io, dispatch) {
  io.on('statistics-result', (data) => {
    dispatch({
      type: actions.statisticsLoaded.type,
      statistics: data
    })
  })

  io.on('statistics-refresh-result', (data) => {
    dispatch({
      type: actions.resultRefreshStatistic.type,
      statistic: data
    })
  })
}
