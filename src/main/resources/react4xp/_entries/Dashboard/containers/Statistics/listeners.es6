import { actions } from './slice'

export default function setupStatisticsListeners(io, dispatch) {
  io.on('statistics-result', (data) => {
    dispatch({
      type: actions.statisticsLoaded.type,
      statistics: data
    })
  })
}
