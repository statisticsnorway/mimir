import { createSelector } from '@reduxjs/toolkit'

import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.common || initialState

export const selectIsConnected = createSelector(
  [selectDomain],
  (commonState) => commonState.isConnected,
)

export const selectLoadingClearCache = createSelector(
  [selectDomain],
  (commonState) => commonState.loadingClearCache,
)
