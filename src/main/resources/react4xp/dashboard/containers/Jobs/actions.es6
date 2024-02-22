import { actions } from '/react4xp/dashboard/containers/Jobs/slice'

export function requestJobs(dispatch, io) {
  dispatch({
    type: actions.loadJobs.type,
  })

  io.emit('dashboard-jobs')
}
