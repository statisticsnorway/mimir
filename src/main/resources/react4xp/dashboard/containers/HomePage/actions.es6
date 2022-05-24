import { actions } from './slice'

export function requestClearCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingClearCache.type
  })

  io.emit('clear-cache')
}

export function requestPurgeVarnishCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingPurgeVarnishCache.type
  })
  io.emit('purge-varnish')
}

export function setUserServerSide(dispatch, io, user) {
  io.emit('dashboard-register-user', user)
}

export function requestServerTime(dispatch, io) {
  io.emit('dashboard-server-time')
}
