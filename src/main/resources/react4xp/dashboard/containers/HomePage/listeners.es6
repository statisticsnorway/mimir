import { actions } from './slice'

export default function setupHomePageListeners(io, dispatch) {
  io.on('clear-cache-finished', (data) => {
    dispatch({
      type: actions.stopLoadingClearCache.type
    })
  })

  io.on('purge-varnish-finished', (data) => {
    dispatch({
      type: actions.stopLoadingPurgeVarnishCache.type,
      status: data.status
    })
  })

  io.on('dashboard-server-time-result', (data) => {
    dispatch({
      type: actions.serverTimeLoaded.type,
      serverTime: data
    })
  })
}
