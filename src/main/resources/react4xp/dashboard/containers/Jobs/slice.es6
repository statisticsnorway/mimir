import { createSlice } from '/react4xp/dashboard/utils/@reduxjs/toolkit'

export const initialState = {
  jobs: [],
  loading: true,
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    loadJobs(state) {
      state.loading = true
      state.jobs = []
    },
    jobsLoaded(state, action) {
      state.jobs = action.jobs
      state.loading = false
    },
  },
})

export const { actions, reducer, name: sliceKey } = jobsSlice
