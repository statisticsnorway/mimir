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

export function setOpenStatistic(dispatch, id) {
  dispatch({
    type: actions.setOpenStatistic.type,
    id
  })
}

export function resetRefreshStatus(dispatch, status) {
  dispatch({
    type: actions.resetRefreshStatus.type,
    status
  })
}

export function setOpenModal(dispatch, status) {
  dispatch({
    type: actions.setOpenModal.type,
    status
  })
}
