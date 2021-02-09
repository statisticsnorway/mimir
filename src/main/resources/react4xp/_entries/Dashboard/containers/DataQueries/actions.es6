import { actions } from './slice'

export function requestErrorQueries(dispatch, io) {
  dispatch({
    type: actions.loadErrorQueries.type
  })

  io.emit('get-error-queries')
}

export function requestFactPageQueryGroups(dispatch, io) {
  dispatch({
    type: actions.loadFactPageQueryGroups.type
  })

  io.emit('get-fact-page-query-groups')
}

export function requestFactPageDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadFactPageDataSources.type,
      id
    })

    io.emit('get-fact-page-data-sources', id)
  }
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
