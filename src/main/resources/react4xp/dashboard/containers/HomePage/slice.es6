import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  isConnected: false,
  loadingClearCache: false,
  loadingPurgeVarnish: false,
  varnishPurgeResult: '',
  user: undefined,
  dashboardOptions: {},
  contentStudioBaseUrl: '',
  dataToolBoxBaseUrl: '',
  internalBaseUrl: '',
  internalStatbankUrl: '',
  serverTime: undefined,
  serverTimeReceived: undefined
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
      state.varnishPurgeResult = createStatusMessage(action.status)
    },
    serverTimeLoaded(state, action) {
      state.serverTime = action.serverTime
      state.serverTimeReceived = Date.now()
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = commonSlice

function createStatusMessage(status) {
  switch (status) {
  case 200:
    return 'Varnish cache cleared successfully'
  case 404:
    return 'Varnish instance not found, 404 returned.'
  case 403:
    return 'Access denied. Check IP range in Varnish config'
  case status >= 500:
    return `Server error code: ${status}`
  default:
    return `Unknown error. No status? Status is: ( ${status} )`
  }
}
