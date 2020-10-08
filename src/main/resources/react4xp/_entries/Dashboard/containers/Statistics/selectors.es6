import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.statistics || initialState

export const selectLoading = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.loading,
)

export const selectStatistics = createSelector(
  [selectDomain],
  (statisticsState) => statisticsState.statistics,
)
