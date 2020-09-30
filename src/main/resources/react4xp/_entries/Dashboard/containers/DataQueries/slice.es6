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
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = dataQueriesSlice
