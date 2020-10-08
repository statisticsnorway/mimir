import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  dataQueries: [],
  loading: true
}

const dataQueriesSlice = createSlice({
  name: 'dataQueries',
  initialState,
  reducers: {
    loadDataQueries(state) {
      state.loading = true
      state.dataQueries = []
    },
    dataQueriesLoaded(state, action) {
      state.loading = false
      state.dataQueries = action.dataQueries
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
