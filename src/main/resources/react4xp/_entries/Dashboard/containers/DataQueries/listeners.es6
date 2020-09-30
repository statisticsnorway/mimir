import { actions } from './slice'

export default function setupDataQuieriesListeners(io, dispatch) {
  io.on('dataqueries-result', (data) => {
    dispatch({
      type: actions.dataQueriesLoaded.type,
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
