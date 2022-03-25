import { createContext, useContext } from 'react'

const BestBetContext = createContext()

export function useBestBetContext() {
  return useContext(BestBetContext)
}

export default BestBetContext
