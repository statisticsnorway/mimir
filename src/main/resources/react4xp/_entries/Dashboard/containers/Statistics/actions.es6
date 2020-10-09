import { actions } from './slice'

export function requestStatistics(dispatch, io) {
  dispatch({
    type: actions.loadStatistics.type
  })

  io.emit('get-statistics')
}
