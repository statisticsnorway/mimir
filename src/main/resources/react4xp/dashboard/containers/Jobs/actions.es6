import { actions } from './slice'

export function requestJobs(dispatch, io) {
  dispatch({
    type: actions.loadJobs.type,
  })

  io.emit('dashboard-jobs')
}
