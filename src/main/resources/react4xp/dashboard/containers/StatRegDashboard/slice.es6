import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  statuses: [],
  loading: true,
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
      state.statuses = action.statuses
      state.loading = false
    },
    fetchStatusesError(state, action) {
      state.loading = false
    },
    startRefreshStatus(state, action) {
      action.keys.forEach((key) => {
        const status = state.statuses.find((s) => s.key === key)
        status.loading = true
      })
    },
    resultRefreshStatus(state, action) {
      state.statuses = state.statuses.map((s) => {
        if (s.key === action.status.key) {
          return action.status
        } else {
          return s
        }
      })
    },
    statRegEventLogLoading(state, action) {
      const statReg = state.statuses.find((s) => s.key === action.key)
      if (statReg) {
        statReg.loadingLogs = true
        statReg.eventLogNodes = []
      }
    },
    statRegEventLogLoaded(state, action) {
      const statReg = state.statuses.find((s) => s.key === action.id)
      if (statReg) {
        statReg.loadingLogs = false
        statReg.eventLogNodes = action.logs
      }
    },
  },
})

export const { actions, reducer, name: sliceKey } = statRegSlice
