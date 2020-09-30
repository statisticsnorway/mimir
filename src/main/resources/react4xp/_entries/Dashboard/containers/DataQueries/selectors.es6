import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.dataQueries || initialState

export const selectLoading = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loading,
)

export const selectDataQueries = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.dataQueries,
)
