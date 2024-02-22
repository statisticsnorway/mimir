import { actions } from '/react4xp/dashboard/containers/HomePage/slice'

export function requestClearCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingClearCache.type,
  })

  io.emit('clear-cache')
}

export function requestPurgeVarnishCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingPurgeVarnishCache.type,
  })
  io.emit('purge-varnish')
}

export function requestRefreshNameGraph(dispatch, io) {
  dispatch({
    type: actions.startLoadingRefreshNameGraph.type,
  })
  io.emit('dashboard-refresh-namegraph')
}

export function setUserServerSide(dispatch, io, user) {
  io.emit('dashboard-register-user', user)
}

export function requestServerTime(dispatch, io) {
  io.emit('dashboard-server-time')
}
