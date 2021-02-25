import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  statistics: [],
  statisticsLogData: [],
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
      let stat = state.statistics.find((s) => s.id === action.id)
      if (!stat) {
        // from search dropdown, move to statistics array
        stat = state.statisticsSearchList.find((s) => s.id === action.id)
        if (stat) {
          state.statistics.push(stat)
        }
      }
      state.openStatistic = action.id
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
        }
      }
    },
    statisticsOwnersWithSourcesLoaded(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          stat.ownersWithSources = action.data.ownersWithSources
          stat.loadingOwnersWithSources = false
        }
      }
    },
    loadStatisticsRelatedTables(state, action) {
      if (action.id) {
        const stat = state.statistics.find((s) => s.id === action.id)
        if (stat) {
          stat.loadingRelatedTablesAndOwnersWithSources = true
        }
      }
    },
    statisticsRelatedTablesLoaded(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          stat.relatedTables = action.data.relatedTables
          stat.ownersWithSources = action.data.ownersWithSources
          stat.loadingRelatedTablesAndOwnersWithSources = false
        }
      }
    },
    statisticJoblogLoaded(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          stat.logData = action.data.jobLogs
        }
      }
    },
    statisticJoblogDetailsLoaded(state, action) {
      if (action.data) {
        const statsLogData = state.statisticsLogData.find((s) => s.id === action.data.id)
        if (statsLogData) {
          const jobLog = statsLogData.logs.find((v) => v.jobId === action.data.logs.jobId)
          if (!jobLog) {
            statsLogData.logs.push({
              jobLog: action.data.logs.jobId,
              details: action.data.logs.logDetails,
              dataLoaded: true
            })
          }
        } else {
          const logObject = {
            id: action.data.id,
            logs: [{
              jobId: action.data.logs.jobId,
              details: action.data.logs.logDetails,
              dataLoaded: true
            }]
          }
          state.statisticsLogData.push(logObject)
        }
      }
    }
  }
})

/*
* structure of statisticsLogData
*
 statisticsLogData = [{
  id: 1234-sdf,
  logs: [{
    jobId: 543-123,
    dataLoaded: true,
    details: [{
      displayName: 'something titleish',
      eventLogResults: [{
        id: 98723-sdf,
        score: 0
      }]
    }]
  }]
}]

 */

export const {
  actions, reducer, name: sliceKey
} = statisticsSlice
