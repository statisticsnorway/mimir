import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'
import { groupBy } from 'ramda'

const byParentType = groupBy((dataSource) => {
  if (dataSource.logData && dataSource.logData.showWarningIcon) {
    return 'error'
  }
  return dataSource.parentType
})

// First select the relevant part from the state
const selectDomain = (state) => state.dataSources || initialState

export const selectLoadingErrors = createSelector([selectDomain], (dataSourcesState) => dataSourcesState.loadingErrors)

export const selectLoadingFactPageGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.loadingFactPageGroups
)

export const selectLoadingStatisticsGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.loadingStatisticsGroups
)

export const selectLoadingMunicipalGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.loadingMunicipalGroups
)

export const selectLoadingDefaultDataSources = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.loadingDefault
)

export const selectDataSources = createSelector([selectDomain], (dataSourcesState) => dataSourcesState.dataSources)

export const selectFactPageGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.factPageGroups
)

export const selectStatisticsGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.statisticsGroups
)

export const selectMunicipalGroups = createSelector(
  [selectDomain],
  (dataSourcesState) => dataSourcesState.municipalGroups
)

export const selectDataSourcesByParentType = (dataSourceType) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const groupedDataSources = byParentType(dataSourcesState.dataSources)
    if (groupedDataSources[dataSourceType]) {
      return groupedDataSources[dataSourceType]
    }
    return []
  })
}

export const selectDataSourcesByType = (dataSourceType) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    return dataSourcesState.dataSources.filter((ds) => ds.type === dataSourceType)
  })
}

export const selectDataSourceById = (dataSourceId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    return dataSourcesState.dataSources.find((ds) => ds.id === dataSourceId)
  })
}

export const selectFactPageLoading = (factPageId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const factPage = dataSourcesState.factPageGroups.find((factPage) => factPage.id === factPageId)
    return factPage && (factPage.loading || factPage.dataSources === undefined)
  })
}

export const selectFactPageDataSources = (factPageId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const factPage = dataSourcesState.factPageGroups.find((factPage) => factPage.id === factPageId)
    if (factPage && !factPage.loading && factPage.dataSources) {
      return factPage.dataSources.map((dataSourceId) => {
        return dataSourcesState.dataSources.find((dq) => dq.id === dataSourceId)
      })
    }
    return []
  })
}

export const selectStatisticsLoading = (statisticId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const statistic = dataSourcesState.statisticsGroups.find((statistic) => statistic.id === statisticId)
    return statistic && (statistic.loading || statistic.dataSources === undefined)
  })
}

export const selectStatisticsDataSources = (statisticId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const statistic = dataSourcesState.statisticsGroups.find((statistic) => statistic.id === statisticId)
    if (statistic && !statistic.loading && statistic.dataSources) {
      return statistic.dataSources.map((dataSourceId) => {
        return dataSourcesState.dataSources.find((dq) => dq.id === dataSourceId)
      })
    }
    return []
  })
}

export const selectMunicipalLoading = (municipalId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const municipal = dataSourcesState.municipalGroups.find((municipal) => municipal.id === municipalId)
    return municipal && (municipal.loading || municipal.dataSources === undefined)
  })
}

export const selectMunicipalDataSources = (municipalId) => {
  return createSelector([selectDomain], (dataSourcesState) => {
    const municipal = dataSourcesState.municipalGroups.find((municipal) => municipal.id === municipalId)
    if (municipal && !municipal.loading && municipal.dataSources) {
      return municipal.dataSources.map((dataSourceId) => {
        return dataSourcesState.dataSources.find((dq) => dq.id === dataSourceId)
      })
    }
    return []
  })
}
