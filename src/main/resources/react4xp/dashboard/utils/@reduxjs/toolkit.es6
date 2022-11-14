import { createSlice as createSliceOriginal } from '@reduxjs/toolkit'

/* Wrap createSlice with stricter Name options */

/* istanbul ignore next */
export const createSlice = (options) => {
  return createSliceOriginal(options)
}
