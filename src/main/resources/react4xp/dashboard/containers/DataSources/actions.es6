import { actions } from '/react4xp/dashboard/containers/DataSources/slice'

export function requestErrorDataSources(dispatch, io) {
  dispatch({
    type: actions.loadErrorDataSources.type,
  })

  io.emit('get-error-data-sources')
}

export function requestFactPageGroups(dispatch, io) {
  dispatch({
    type: actions.loadFactPageGroups.type,
  })

  io.emit('get-fact-page-groups')
}

export function requestStatisticsGroups(dispatch, io) {
  dispatch({
    type: actions.loadStatisticsGroups.type,
  })

  io.emit('get-statistics-groups')
}

export function requestMunicipalGroups(dispatch, io) {
  dispatch({
    type: actions.loadMunicipalGroups.type,
  })

  io.emit('get-municipal-groups')
}

export function requestFactPageDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadFactPageDataSources.type,
      id,
    })

    io.emit('get-fact-page-data-sources', id)
  }
}

export function requestStatisticsDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadStatisticsDataSources.type,
      id,
    })

    io.emit('get-statistics-data-sources', id)
  }
}

export function requestMunicipalDataSources(id) {
  return (dispatch, io) => {
    dispatch({
      type: actions.loadMunicipalDataSources.type,
      id,
    })

    io.emit('get-municipal-data-sources', id)
  }
}

export function requestDefaultDataSources(dispatch, io) {
  dispatch({
    type: actions.loadDefaultDataSources.type,
  })

  io.emit('get-default-data-sources')
}

export function requestDatasetUpdate(dispatch, io, ids) {
  dispatch({
    type: actions.dataSourceLoading.type,
    ids,
  })
  io.emit('dashboard-refresh-dataset', {
    ids,
  })
}

export function requestEventLogData(dispatch, io, id) {
  dispatch({
    type: actions.dataSourceEventLogLoading.type,
    id,
  })
  io.emit('get-eventlog-node', id)
}
