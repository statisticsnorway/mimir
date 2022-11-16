import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.statReg || initialState

export const selectLoading = createSelector([selectDomain], (statRegState) => statRegState.loading)

export const selectStatuses = createSelector([selectDomain], (statRegState) => statRegState.statuses)

export const selectStatRegStatus = (statRegKey) => {
  return createSelector([selectDomain], (statRegState) => {
    return statRegState.statuses.find((q) => q.key === statRegKey)
  })
}
