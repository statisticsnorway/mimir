import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  dataQueries: [],
  factPageQueryGroups: [],
  statisticsGroups: [],
  municipalGroups: [],
  loadingErrors: true,
  loadingFactPageQueryGroups: true,
  loadingStatisticsGroups: true,
  loadingMunicipalGroups: true,
  loadingDefault: true
}

const dataQueriesSlice = createSlice({
  name: 'dataQueries',
  initialState,
  reducers: {
    loadErrorQueries(state) {
      state.loadingErrors = true
    },
    errorQueriesLoaded(state, action) {
      state.dataQueries = action.dataQueries.reduce((dataQueries, ds) => {
        if (!dataQueries.find((dq) => dq.id === ds.id)) {
          dataQueries.push(ds)
        }
        return dataQueries
      }, state.dataQueries)
      state.loadingErrors = false
    },
    loadDefaultDataSources(state) {
      state.loadingDefault = true
    },
    defaultDataSourcesLoaded(state, action) {
      state.dataQueries = action.dataSources.reduce((dataQueries, ds) => {
        if (!dataQueries.find((dq) => dq.id === ds.id)) {
          dataQueries.push(ds)
        }
        return dataQueries
      }, state.dataQueries)
      state.loadingDefault = false
    },
    loadFactPageQueryGroups(state) {
      state.loadingFactPageQueryGroups = true
      state.factPageQueryGroups = []
    },
    factPageQueryGroupsLoaded(state, action) {
      state.loadingFactPageQueryGroups = false
      state.factPageQueryGroups = action.factPageQueryGroups
    },
    loadFactPageDataSources(state, action) {
      const factPage = state.factPageQueryGroups.find((factPage) => factPage.id === action.id)
      if (factPage) {
        factPage.loading = true
      }
    },
    factPageDataSourcesLoaded(state, action) {
      const factPage = state.factPageQueryGroups.find((factPage) => factPage.id === action.id)
      if (factPage) {
        factPage.dataSources = action.dataSources.map((ds) => ds.id)
        state.dataQueries = action.dataSources.reduce((dataQueries, ds) => {
          if (!dataQueries.find((dq) => dq.id === ds.id)) {
            dataQueries.push(ds)
          }
          return dataQueries
        }, state.dataQueries)
        factPage.loading = false
      }
    },
    loadStatisticsGroups(state) {
      state.loadingStatisticsGroups = true
      state.statisticsGroups = []
    },
    statisticsGroupsLoaded(state, action) {
      state.loadingStatisticsGroups = false
      state.statisticsGroups = action.statisticsGroups
    },
    loadStatisticsDataSources(state, action) {
      const statistic = state.statisticsGroups.find((statistic) => statistic.id === action.id)
      if (statistic) {
        statistic.loading = true
      }
    },
    statisticsDataSourcesLoaded(state, action) {
      const statistic = state.statisticsGroups.find((statistic) => statistic.id === action.id)
      if (statistic) {
        statistic.dataSources = action.dataSources.map((ds) => ds.id)
        state.dataQueries = action.dataSources.reduce((dataQueries, ds) => {
          if (!dataQueries.find((dq) => dq.id === ds.id)) {
            dataQueries.push(ds)
          }
          return dataQueries
        }, state.dataQueries)
        statistic.loading = false
      }
    },
    loadMunicipalGroups(state) {
      state.loadingMunicipalGroups = true
      state.municipalGroups = []
    },
    municipalGroupsLoaded(state, action) {
      state.loadingMunicipalGroups = false
      state.municipalGroups = action.municipalGroups
    },
    loadMunicipalDataSources(state, action) {
      const municipal = state.municipalGroups.find((municipal) => municipal.id === action.id)
      if (municipal) {
        municipal.loading = true
      }
    },
    municipalDataSourcesLoaded(state, action) {
      const municipal = state.municipalGroups.find((municipal) => municipal.id === action.id)
      if (municipal) {
        municipal.dataSources = action.dataSources.map((ds) => ds.id)
        state.dataQueries = action.dataSources.reduce((dataQueries, ds) => {
          if (!dataQueries.find((dq) => dq.id === ds.id)) {
            dataQueries.push(ds)
          }
          return dataQueries
        }, state.dataQueries)
        municipal.loading = false
      }
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
