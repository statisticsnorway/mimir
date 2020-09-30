import { actions } from './slice'

export default function setupDataQuieriesListeners(io, dispatch) {
  io.on('dataqueries-result', (data) => {
    dispatch({
      type: actions.dataQueriesLoaded.type,
      dataQueries: data
    })
  })
}
