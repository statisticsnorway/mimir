import { actions } from './slice'

export function requestDataQueries(dispatch, io) {
  dispatch({
    type: actions.loadDataQueries.type
  })

  io.emit('get-dataqueries-error')
}

export function requestDatasetUpdate(dispatch, io, ids) {
  dispatch({
    type: actions.dataQueryLoading.type,
    ids
  })
  io.emit('dashboard-refresh-dataset', {
    ids
  })
}

export function requestEventLogData(dispatch, io, id) {
  dispatch({
    type: actions.dataQueryEventLogLoading.type,
    id
  })
  io.emit('get-eventlog-node', id)
}
