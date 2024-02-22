import { actions } from '/react4xp/dashboard/containers/Jobs/slice'

export default function setupJobsListeners(io, dispatch) {
  io.on('dashboard-jobs-result', (data) => {
    dispatch({
      type: actions.jobsLoaded.type,
      jobs: data,
    })
  })
}
