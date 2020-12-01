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

  io.on('statistics-activity-refresh-started', (data) => {
    dispatch({
      type: actions.startRefreshStatistic.type,
      id: data.id
    })
  })

  io.on('statistics-activity-refresh-feedback', (data) => {
    dispatch({
      type: actions.setRefreshStatisticStatus.type,
      data
    })
  })
}
