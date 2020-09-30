import { actions } from './slice'

export function requestDataQueries(dispatch, io) {
  dispatch({
    type: actions.loadDataQueries.type
  })

  io.emit('get-dataqueries')
}
