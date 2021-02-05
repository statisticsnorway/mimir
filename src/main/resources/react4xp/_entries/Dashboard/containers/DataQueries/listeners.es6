import { actions } from './slice'

export default function setupDataQueriesListeners(io, dispatch) {
  io.on('error-queries-result', (data) => {
    dispatch({
      type: actions.errorQueriesLoaded.type,
      dataQueries: data
    })
  })

  io.on('dashboard-activity-refreshDataset-result', (data) => {
    dispatch({
      type: actions.dataQueryLoaded.type,
      dataQuery: data
    })
  })

  io.on('dashboard-activity-refreshDataset', (data) => {
    dispatch({
      type: actions.dataQueryLoading.type,
      ids: [data.id]
    })
  })

  io.on('eventlog-node-result', (data) => {
    dispatch({
      type: actions.dataQueryEventLogLoaded.type,
      id: data.id,
      logs: data.logs
    })
  })
}
