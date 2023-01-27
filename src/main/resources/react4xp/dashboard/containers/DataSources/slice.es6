import { createSlice } from '/react4xp/dashboard/utils/@reduxjs/toolkit'

export const initialState = {
  dataSources: [],
  factPageGroups: [],
  statisticsGroups: [],
  municipalGroups: [],
  loadingErrors: true,
  loadingFactPageGroups: true,
  loadingStatisticsGroups: true,
  loadingMunicipalGroups: true,
  loadingDefault: true,
}

const dataSourcesSlice = createSlice({
  name: 'dataSources',
  initialState,
  reducers: {
    loadErrorDataSources(state) {
      state.loadingErrors = true
    },
    errorDataSourcesLoaded(state, action) {
      state.dataSources = action.dataSources.reduce((dataSources, ds) => {
        if (!dataSources.find((dq) => dq.id === ds.id)) {
          dataSources.push(ds)
        }
        return dataSources
      }, state.dataSources)
      state.loadingErrors = false
    },
    loadDefaultDataSources(state) {
      state.loadingDefault = true
    },
    defaultDataSourcesLoaded(state, action) {
      state.dataSources = action.dataSources.reduce((dataSources, ds) => {
        if (!dataSources.find((dq) => dq.id === ds.id)) {
          dataSources.push(ds)
        }
        return dataSources
      }, state.dataSources)
      state.loadingDefault = false
    },
    loadFactPageGroups(state) {
      state.loadingFactPageGroups = true
      state.factPageGroups = []
    },
    factPageGroupsLoaded(state, action) {
      state.loadingFactPageGroups = false
      state.factPageGroups = action.factPageGroups
    },
    loadFactPageDataSources(state, action) {
      const factPage = state.factPageGroups.find((factPage) => factPage.id === action.id)
      if (factPage) {
        factPage.loading = true
      }
    },
    factPageDataSourcesLoaded(state, action) {
      const factPage = state.factPageGroups.find((factPage) => factPage.id === action.id)
      if (factPage) {
        factPage.dataSources = action.dataSources.map((ds) => ds.id)
        state.dataSources = action.dataSources.reduce((dataSources, ds) => {
          if (!dataSources.find((dq) => dq.id === ds.id)) {
            dataSources.push(ds)
          }
          return dataSources
        }, state.dataSources)
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
        state.dataSources = action.dataSources.reduce((dataSources, ds) => {
          if (!dataSources.find((dq) => dq.id === ds.id)) {
            dataSources.push(ds)
          }
          return dataSources
        }, state.dataSources)
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
        state.dataSources = action.dataSources.reduce((dataSources, ds) => {
          if (!dataSources.find((dq) => dq.id === ds.id)) {
            dataSources.push(ds)
          }
          return dataSources
        }, state.dataSources)
        municipal.loading = false
      }
    },
    dataSourceLoading(state, action) {
      action.ids.forEach((id) => {
        const dataSource = state.dataSources.find((q) => q.id === id)
        if (dataSource) {
          dataSource.loading = true
        }
      })
    },
    dataSourceLoaded(state, action) {
      const dataSource = state.dataSources.find((q) => q.id === action.dataSource.id)
      if (dataSource) {
        dataSource.message = action.dataSource.message
        dataSource.status = action.dataSource.status
        if (action.dataSource.logData) {
          dataSource.logData = action.dataSource.logData
        }
        if (action.dataSource.dataset) {
          dataSource.dataset = action.dataSource.dataset
        }
        dataSource.loading = false
      }
    },
    dataSourceEventLogLoading(state, action) {
      const dataSource = state.dataSources.find((q) => q.id === action.id)
      if (dataSource) {
        dataSource.loadingLogs = true
        dataSource.eventLogNodes = []
      }
    },
    dataSourceEventLogLoaded(state, action) {
      const dataSource = state.dataSources.find((q) => q.id === action.id)
      if (dataSource) {
        dataSource.loadingLogs = false
        dataSource.eventLogNodes = action.logs
      }
    },
  },
})

export const { actions, reducer, name: sliceKey } = dataSourcesSlice
