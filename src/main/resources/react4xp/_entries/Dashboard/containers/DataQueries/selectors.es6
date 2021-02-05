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

export const selectDataQueries = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.dataQueries,
)

export const selectFactPageQueryGroups = createSelector(
  [selectDomain],
  (dataQueriesState) => dataQueriesState.factPageQueryGroups
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
