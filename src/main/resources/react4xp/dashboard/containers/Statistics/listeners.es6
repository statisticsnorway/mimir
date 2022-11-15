import { actions } from './slice'

export default function setupStatisticsListeners(io, dispatch) {
  io.on('statistics-result', (data) => {
    dispatch({
      type: actions.statisticsLoaded.type,
      statistics: data,
    })
  })

  io.on('statistics-refresh-result', (data) => {
    dispatch({
      type: actions.resultRefreshStatistic.type,
      statistic: data,
    })
  })

  io.on('statistics-activity-refresh-started', (data) => {
    dispatch({
      type: actions.startRefreshStatistic.type,
      id: data.id,
    })
  })

  io.on('statistics-activity-refresh-feedback', (data) => {
    dispatch({
      type: actions.setRefreshStatisticStatus.type,
      data,
    })
  })

  io.on('statistics-activity-refresh-complete', (data) => {
    dispatch({
      type: actions.setModalDisplay.type,
      data,
    })
  })

  io.on('statistics-refresh-result-log', (data) => {
    dispatch({
      type: actions.updateStatisticsLog.type,
      data,
    })
  })

  io.on('statistics-search-list-result', (data) => {
    dispatch({
      type: actions.statisticsSearchListLoaded.type,
      statisticsSearchList: data,
    })
  })

  io.on('statistics-owners-with-sources-result', (data) => {
    dispatch({
      type: actions.statisticsOwnersWithSourcesLoaded.type,
      data,
    })
  })

  io.on('statistics-related-tables-and-owners-with-sources-result', (data) => {
    dispatch({
      type: actions.statisticsRelatedTablesLoaded.type,
      data,
    })
  })

  io.on('get-statistics-job-log-result', (data) => {
    dispatch({
      type: actions.statisticJobLogLoaded.type,
      data,
    })
  })

  io.on('get-statistic-job-log-details-result', (data) => {
    dispatch({
      type: actions.statisticJobLogDetailsLoaded.type,
      data,
    })
  })
}
