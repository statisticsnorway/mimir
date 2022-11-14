import { actions } from './slice'

export function requestStatuses(dispatch, io) {
  dispatch({
    type: actions.loadStatuses.type,
  })

  io.emit('statreg-dashboard-status')
}

export function startRefresh(dispatch, io, keys) {
  dispatch({
    type: actions.startRefreshStatus.type,
    keys,
  })

  io.emit('statreg-dashboard-refresh', keys)
}

export function requestStatRegEventLogData(dispatch, io, id) {
  dispatch({
    type: actions.statRegEventLogLoading.type,
    id,
  })
  io.emit('get-statreg-eventlog-node', id)
}
