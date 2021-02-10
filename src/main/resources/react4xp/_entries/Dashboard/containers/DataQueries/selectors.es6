import { createSelector } from '@reduxjs/toolkit'
import { initialState } from './slice'
import { groupBy } from 'ramda'

const byParentType = groupBy((dataQuery) => {
  if (dataQuery.logData && dataQuery.logData.showWarningIcon) {
    return 'error'
  }
  return dataQuery.parentType
})

// First select the relevant part from the state
const selectDomain = (state) => state.dataQueries || initialState

export const selectLoadingErrors = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loadingErrors,
)

export const selectLoadingFactPageQueryGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loadingFactPageQueryGroups,
)

export const selectLoadingStatisticsGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loadingStatisticsGroups,
)

export const selectLoadingMunicipalGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loadingMunicipalGroups,
)

export const selectLoadingDefaultDataSources = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.loadingDefault,
)

export const selectDataQueries = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.dataQueries,
)

export const selectFactPageQueryGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.factPageQueryGroups
)

export const selectStatisticsGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.statisticsGroups,
)

export const selectMunicipalGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.municipalGroups
)

export const selectDataQueriesByParentType = (dataQueryType) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const groupedQueries = byParentType(dataQueriesState.dataQueries)
      if (groupedQueries[dataQueryType]) {
        return groupedQueries[dataQueryType]
      }
      return []
    },
  )
}

export const selectDataQueriesByType = (dataQueryType) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      return dataQueriesState.dataQueries.filter((q) => q.type === dataQueryType)
    },
  )
}

export const selectDataQueriesById = (dataQueryId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      return dataQueriesState.dataQueries.find((q) => q.id === dataQueryId)
    },
  )
}

export const selectFactPageLoading = (factPageId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const factPage = dataQueriesState.factPageQueryGroups.find((factPage) => factPage.id === factPageId)
      return factPage && (factPage.loading || factPage.dataSources === undefined)
    },
  )
}

export const selectFactPageDataQueries = (factPageId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const factPage = dataQueriesState.factPageQueryGroups.find((factPage) => factPage.id === factPageId)
      if (factPage && !factPage.loading && factPage.dataSources) {
        return factPage.dataSources.map((dataSourceId) => {
          return dataQueriesState.dataQueries.find((dq) => dq.id === dataSourceId)
        })
      }
      return []
    },
  )
}

export const selectStatisticsLoading = (statisticId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const statistic = dataQueriesState.statisticsGroups.find((statistic) => statistic.id === statisticId)
      return statistic && (statistic.loading || statistic.dataSources === undefined)
    },
  )
}

export const selectStatisticsDataSources = (statisticId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const statistic = dataQueriesState.statisticsGroups.find((statistic) => statistic.id === statisticId)
      if (statistic && !statistic.loading && statistic.dataSources) {
        return statistic.dataSources.map((dataSourceId) => {
          return dataQueriesState.dataQueries.find((dq) => dq.id === dataSourceId)
        })
      }
      return []
    },
  )
}

export const selectMunicipalLoading = (municipalId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const municipal = dataQueriesState.municipalGroups.find((municipal) => municipal.id === municipalId)
      return municipal && (municipal.loading || municipal.dataSources === undefined)
    },
  )
}

export const selectMunicipalDataSources = (municipalId) => {
  return createSelector(
    [selectDomain],
    (dataQueriesState) => {
      const municipal = dataQueriesState.municipalGroups.find((municipal) => municipal.id === municipalId)
      if (municipal && !municipal.loading && municipal.dataSources) {
        return municipal.dataSources.map((dataSourceId) => {
          return dataQueriesState.dataQueries.find((dq) => dq.id === dataSourceId)
        })
      }
      return []
    },
  )
}
