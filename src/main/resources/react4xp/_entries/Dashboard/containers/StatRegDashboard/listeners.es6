import { actions } from './slice'

export default function setupStatRegListeners(io, dispatch) {
  io.on('statreg-dashboard-status-result', (data) => {
    dispatch({
      type: actions.statusesLoaded.type,
      statuses: data
    })
  })

  io.on('statreg-dashboard-refresh-result', (data) => {
    dispatch({
      type: actions.resultRefreshStatus.type,
      status: data
    })
  })

  io.on('statreg-dashboard-refresh-start', (data) => {
    dispatch({
      type: actions.startRefreshStatus.type,
      keys: [data]
    })
  })
}
