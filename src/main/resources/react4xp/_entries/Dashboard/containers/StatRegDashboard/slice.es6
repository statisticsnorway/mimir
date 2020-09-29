/*
 * statReg Slice
 *
 * Here we define:
 * - The shape of our container's slice of Redux store,
 * - All the actions which can be triggered for this slice, including their effects on the store.
 *
 * Note that, while we are using dot notation in our reducer, we are not actually mutating the state
 * manually. Under the hood, we use immer to apply these updates to a new copy of the state.
 * Please see https://immerjs.github.io/immer/docs/introduction for more information.
 *
 */

import { createSlice } from '../../utils/@reduxjs/toolkit'

// The initial state of the statReg container
export const initialState = {
  statuses: [],
  loading: true
}

const statRegSlice = createSlice({
  name: 'statReg',
  initialState,
  reducers: {
    loadStatuses(state) {
      state.loading = true
      state.statuses = []
    },
    statusesLoaded(state, action) {
      console.log(action)
      state.statuses = action.statuses
      state.loading = false
    },
    fetchStatusesError(state, action) {
      state.loading = false
      console.log(action.payload)
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = statRegSlice
