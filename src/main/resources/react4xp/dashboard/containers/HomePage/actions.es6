import { actions } from './slice'

export function requestClearCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingClearCache.type
  })

  io.emit('clear-cache')
}

export function requestEmptyVarnishCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingEmptyVarnishCache.type
  })
  io.emit('empty-varnish')
}

export function setUserServerSide(dispatch, io, user) {
  io.emit('dashboard-register-user', user)
}

export function requestServerTime(dispatch, io) {
  io.emit('dashboard-server-time')
}
