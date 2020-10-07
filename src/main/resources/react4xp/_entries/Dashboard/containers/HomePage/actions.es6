import { actions } from './slice'

export function requestClearCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingClearCache.type
  })

  io.emit('clear-cache')
}

export function setUserServerSide(dispatch, io, user) {
  io.emit('dashboard-register-user', {
    user
  })
}
