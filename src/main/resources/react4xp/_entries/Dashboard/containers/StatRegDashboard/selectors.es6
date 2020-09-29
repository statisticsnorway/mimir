import { createSelector } from '@reduxjs/toolkit'
import { initialState, actions } from './slice'

// First select the relevant part from the state
const selectDomain = (state) => state.statReg || initialState

export const selectLoading = createSelector(
  [selectDomain],
  (statRegState) => statReg.loading,
)

export const selectStatuses = createSelector(
  [selectDomain],
  (statRegState) => statReg.statuses,
)

export function requestStatuses() {
  return (dispatch) => {
    dispatch({
      type: actions.loadStatuses.type
    })

    setTimeout(() => {
      dispatch({
        type: actions.statusesLoaded.type,
        statuses: []
      })
    }, 2000)
  }
}
