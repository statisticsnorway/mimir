import { createSelector } from '@reduxjs/toolkit'

import { initialState } from '/react4xp/dashboard/containers/HomePage/slice'

// First select the relevant part from the state
const selectDomain = (state) => state.common || initialState

export const selectIsConnected = createSelector([selectDomain], (commonState) => commonState.isConnected)

export const selectLoadingClearCache = createSelector([selectDomain], (commonState) => commonState.loadingClearCache)

export const selectLoadingPurgeVarnish = createSelector(
  [selectDomain],
  (commonState) => commonState.loadingPurgeVarnish
)

export const selectLoadingRefreshNameGraph = createSelector(
  [selectDomain],
  (commonState) => commonState.loadingRefreshNameGraph
)

export const selectVarnishPurgeResult = createSelector([selectDomain], (commonState) => commonState.varnishPurgeResult)

export const selectRefreshNameGraphResult = createSelector(
  [selectDomain],
  (commonState) => commonState.refreshNameGraphResult
)

export const selectContentStudioBaseUrl = createSelector(
  [selectDomain],
  (commonState) => commonState.contentStudioBaseUrl
)

export const selectDataToolBoxBaseUrl = createSelector([selectDomain], (commonState) => commonState.dataToolBoxBaseUrl)

export const selectInternalBaseUrl = createSelector([selectDomain], (commonState) => commonState.internalBaseUrl)

export const selectStatregRapportUrl = createSelector([selectDomain], (commonState) => commonState.statregRapportUrl)

export const selectInternalStatbankUrl = createSelector(
  [selectDomain],
  (commonState) => commonState.internalStatbankUrl
)

export const selectDashboardOptions = createSelector([selectDomain], (commonState) => commonState.dashboardOptions)

export const selectServerTime = createSelector([selectDomain], (commonState) => commonState.serverTime)

export const selectServerTimeReceived = createSelector([selectDomain], (commonState) => commonState.serverTimeReceived)
