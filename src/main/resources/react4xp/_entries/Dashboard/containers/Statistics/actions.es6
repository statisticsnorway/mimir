import { actions } from './slice'

export function requestStatistics(dispatch, io) {
  dispatch({
    type: actions.loadStatistics.type
  })

  io.emit('get-statistics')
}

export function refreshStatistic(dispatch, io, id, owners, fetchPublished) {
  dispatch({
    type: actions.startRefreshStatistic.type,
    id
  })

  io.emit('refresh-statistic', {
    id,
    owners,
    fetchPublished
  })
}
