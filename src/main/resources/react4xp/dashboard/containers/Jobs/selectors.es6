import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.jobs || initialState

export const selectLoading = createSelector([selectDomain], (jobsState) => jobsState.loading)

export const selectJobs = createSelector([selectDomain], (jobsState) => jobsState.jobs)
