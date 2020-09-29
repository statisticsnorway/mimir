import { createSlice } from '../../utils/@reduxjs/toolkit'

export const initialState = {
  isConnected: false
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    onConnect(state) {
      state.isConnected = true
      console.log(state)
    },
    onDisconnect(state) {
      state.isConnected = false
    }
  }
})

export const {
  actions, reducer, name: sliceKey
} = commonSlice
