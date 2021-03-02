import { actions } from './slice'

export default function setupHomePageListeners(io, dispatch) {
  io.on('clear-cache-finished', (data) => {
    dispatch({
      type: actions.stopLoadingClearCache.type
    })
  })
}
