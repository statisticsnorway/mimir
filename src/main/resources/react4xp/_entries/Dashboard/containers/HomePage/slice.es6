import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  isConnected: false,
  loadingClearCache: false,
  user: undefined,
  contentStudioBaseUrl: ''
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setContentStudioBaseUrl(state, action) {
      state.contentStudioBaseUrl = action.contentStudioBaseUrl
    },
    setUser(state, action) {
      state.user = action.user
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
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = commonSlice
