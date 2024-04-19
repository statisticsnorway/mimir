import { createSlice } from '/react4xp/dashboard/utils/@reduxjs/toolkit'

export const initialState = {
  isConnected: undefined,
  loadingClearCache: false,
  loadingPurgeVarnish: false,
  loadingRefreshNameGraph: false,
  varnishPurgeResult: '',
  refreshNameGraphResult: '',
  user: undefined,
  dashboardOptions: {},
  contentStudioBaseUrl: '',
  dataToolBoxBaseUrl: '',
  internalBaseUrl: '',
  internalStatbankUrl: '',
  statregRapportUrl: '',
  serverTime: undefined,
  serverTimeReceived: undefined,
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setContentStudioBaseUrl(state, action) {
      state.contentStudioBaseUrl = action.contentStudioBaseUrl
    },
    setDataToolBoxBaseUrl(state, action) {
      state.dataToolBoxBaseUrl = action.dataToolBoxBaseUrl
    },
    setInternalBaseUrl(state, action) {
      state.internalBaseUrl = action.internalBaseUrl
    },
    setInternalStatbankUrl(state, action) {
      state.internalStatbankUrl = action.internalStatbankUrl
    },
    setStatregRapportUrl(state, action) {
      state.statregRapportUrl = action.statregRapportUrl
    },
    setUser(state, action) {
      state.user = action.user
    },
    setDashboardOptions(state, action) {
      state.dashboardOptions = action.dashboardOptions
    },
    onConnect(state) {
      state.isConnected = true
    },
    onDisconnect(state) {
      state.isConnected = false
    },
    startLoadingClearCache(state) {
      state.loadingClearCache = true
    },
    stopLoadingClearCache(state) {
      state.loadingClearCache = false
    },
    startLoadingPurgeVarnishCache(state) {
      state.loadingPurgeVarnish = true
    },
    stopLoadingPurgeVarnishCache(state, action) {
      state.loadingPurgeVarnish = false
      state.varnishPurgeResult = action.status
    },
    startLoadingRefreshNameGraph(state) {
      state.loadingRefreshNameGraph = true
    },
    stopLoadingRefreshNameGraph(state, action) {
      state.loadingRefreshNameGraph = false
      state.refreshNameGraphResult = action.status
    },
    serverTimeLoaded(state, action) {
      state.serverTime = action.serverTime
      state.serverTimeReceived = Date.now()
    },
  },
})

export const { actions, reducer, name: sliceKey } = commonSlice
