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

export function requestStatisticsGroups(dispatch, io) {
  dispatch({
    type: actions.loadStatisticsGroups.type
  })

  io.emit('get-statistics-groups')
}

export function requestMunicipalGroups(dispatch, io) {
  dispatch({
    type: actions.loadMunicipalGroups.type
  })

  io.emit('get-municipal-groups')
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

export function requestStatisticsDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadStatisticsDataSources.type,
      id
    })

    io.emit('get-statistics-data-sources', id)
  }
}

export function requestMunicipalDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadMunicipalDataSources.type,
      id
    })

    io.emit('get-municipal-data-sources', id)
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
