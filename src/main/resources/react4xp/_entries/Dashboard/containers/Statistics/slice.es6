import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  statistics: [],
  statisticsSearchList: [],
  loading: true,
  loadingSearchList: true,
  openStatistic: null,
  modalDisplay: 'request',
  updateMessage: [],
  openModal: false
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
      state.modalDisplay = 'loading'
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
    },
    updateStatisticsLog(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          if (!stat.logData) {
            stat.logData = [action.data.log]
          } else {
            stat.logData.unshift(action.data.log)
          }
        }
      }
    },
    setRefreshStatisticStatus(state, action) {
      if (action.data.step === 1) {
        state.updateMessage[action.data.tableIndex] = action.data
      } else {
        state.updateMessage[action.data.tableIndex].result = action.data.status
      }
    },
    resetRefreshStatus(state, action) {
      state.modalDisplay = action.status
      state.updateMessage = []
    },
    setOpenModal(state, action) {
      state.openModal = action.status
    },
    setModalDisplay(state, action) {
      state.modalDisplay = action.status
    },
    loadStatisticsSearchList(state) {
      state.loadingSearchList = true
      state.statisticsSearchList = []
    },
    statisticsSearchListLoaded(state, action) {
      state.loadingSearchList = false
      state.statisticsSearchList = action.statisticsSearchList
    },
    loadStatisticsOwnersWithSources(state, action) {
      if (action.id) {
        const stat = state.statistics.find((s) => s.id === action.id)
        if (stat) {
          stat.loadingOwnersWithSources = true
          if (state.openStatistic && state.openStatistic.id === action.id) {
            state.openStatistic = stat
          }
        }
      }
    },
    statisticsOwnersWithSourcesLoaded(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          stat.ownersWithSources = action.data.ownersWithSources
          stat.loadingOwnersWithSources = false
          if (state.openStatistic && state.openStatistic.id === action.data.id) {
            state.openStatistic = stat
          }
        }
      }
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = statisticsSlice
