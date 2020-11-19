import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  statistics: [],
  loading: true,
  openStatistic: null
}

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    loadStatistics(state) {
      state.loading = true
      state.statistics = []
    },
    statisticsLoaded(state, action) {
      state.loading = false
      state.statistics = action.statistics
    },
    startRefreshStatistic(state, action) {
      const stat = state.statistics.find((s) => s.id === action.id)
      stat.loading = true
    },
    resultRefreshStatistic(state, action) {
      const stat = state.statistics.find((s) => s.id === action.statistic.id)
      stat.loading = false
    },
    setOpenStatistic(state, action) {
      if (action.id) {
        const stat = state.statistics.find((s) => s.id === action.id)
        if (stat) {
          state.openStatistic = stat
        }
      } else {
        state.openStatistic = null
      }
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = statisticsSlice
