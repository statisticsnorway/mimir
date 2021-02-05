import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  dataQueries: [],
  loadingErrors: true,
  factPageQueryGroups: [],
  loadingFactPageQueryGroups: true
}

const dataQueriesSlice = createSlice({
  name: 'dataQueries',
  initialState,
  reducers: {
    loadErrorQueries(state) {
      state.loadingErrors = true
    },
    errorQueriesLoaded(state, action) {
      state.loadingErrors = false
      state.dataQueries = state.dataQueries.concat(action.dataQueries)
    },
    loadFactPageQueryGroups(state) {
      state.loadingFactPageQueryGroups = true
      state.factPageQueryGroups = []
    },
    factPageQueryGroupsLoaded(state, action) {
      state.loadingFactPageQueryGroups = false
      state.factPageQueryGroups = action.factPageQueryGroups
    },
    dataQueryLoading(state, action) {
      action.ids.forEach((id) => {
        const dataQuery = state.dataQueries.find((q) => q.id === id)
        if (dataQuery) {
          dataQuery.loading = true
        }
      })
    },
    dataQueryLoaded(state, action) {
      const dataQuery = state.dataQueries.find((q) => q.id === action.dataQuery.id)
      if (dataQuery) {
        dataQuery.message = action.dataQuery.message
        dataQuery.status = action.dataQuery.status
        if (action.dataQuery.logData) {
          dataQuery.logData = action.dataQuery.logData
        }
        if (action.dataQuery.dataset) {
          dataQuery.dataset = action.dataQuery.dataset
        }
        dataQuery.loading = false
      }
    },
    dataQueryEventLogLoading(state, action) {
      const dataQuery = state.dataQueries.find((q) => q.id === action.id)
      if (dataQuery) {
        dataQuery.loadingLogs = true
        dataQuery.eventLogNodes = []
      }
    },
    dataQueryEventLogLoaded(state, action) {
      const dataQuery = state.dataQueries.find((q) => q.id === action.id)
      if (dataQuery) {
        dataQuery.loadingLogs = false
        dataQuery.eventLogNodes = action.logs
      }
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = dataQueriesSlice
