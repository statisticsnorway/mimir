import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  statistics: [],
  statisticsSearchList: [],
  loading: true,
  loadingSearchList: true,
  openStatistic: null,
  openModal: false,
  modals: [],
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
      const modal = state.modals.find((s) => s.statisticId === action.id)
      stat.loading = true
      if (modal && modal.modalDisplay) modal.modalDisplay = 'loading'
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
      const modal = state.modals.find((modal) => modal.statisticId === action.data.relatedStatisticsId)
      if (modal) {
        if (action.data.step === 1) {
          modal.updateMessages[action.data.tableIndex] = action.data
        } else {
          if (!modal.updateMessages[action.data.tableIndex].result) {
            modal.updateMessages[action.data.tableIndex].result = [action.data.status]
          } else {
            modal.updateMessages[action.data.tableIndex].result.push(action.data.status)
          }
        }
      }
    },
    resetRefreshStatus(state, action) {
      state.modalDisplay = action.status
      state.updateMessages = []
    },
    resetModal(state, action) {
      const modal = state.modals.find((modal) => modal.statisticId === action.id)
      if (modal) {
        modal.updateMessages = []
        modal.modalDisplay = 'request'
      }
    },
    setOpenModal(state, action) {
      state.openModal = action.status
    },
    setModal(state, action) {
      const modal = state.modals.find((modal) => modal.statisticId === action.modal.statisticId)
      if (!!modal) {
        modal.openModal = action.modal.openModal
        modal.modalDisplay = action.setModalDisplay
      } else {
        state.modals.push(action.modal)
      }
    },
    setModalDisplay(state, action) {
      const modal = state.modals.find((modal) => modal.statisticId === action.data.id)
      if (modal) {
        modal.modalDisplay = action.data.status
      }
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
    statisticJobLogLoaded(state, action) {
      if (action.data.id) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat) {
          stat.logData = action.data.jobLogs
          stat.logDataLoaded = true
        }
      }
    },
    statisticJobLogDetailsLoaded(state, action) {
      if (action.data) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat && stat.logData) {
          const jobLog = stat.logData.find((v) => v.id === action.data.logs.jobId)
          if (jobLog) {
            jobLog.dataLoaded = true
            jobLog.details = action.data.logs.logDetails
          }
        }
      }
    },
    jobLogDetailsOpened(state, action) {
      if (action.data) {
        const stat = state.statistics.find((s) => s.id === action.data.id)
        if (stat && stat.logData) {
          const jobLog = stat.logData.find((v) => v.id === action.data.logs.jobId)
          if (jobLog) {
            jobLog.dataOpended = true
          }
        }
      }
    },
  },
})

export const { actions, reducer, name: sliceKey } = statisticsSlice
