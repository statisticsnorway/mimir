import { configureStore } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'
import createSagaMiddleware from 'redux-saga'
import { createReducer } from '/react4xp/dashboard/store/reducers'
import { reducer as statRegReducer } from '/react4xp/dashboard/containers/StatRegDashboard/slice'
import { reducer as commonReducer } from '/react4xp/dashboard/containers/HomePage/slice'
import { reducer as dataSourcesReducer } from '/react4xp/dashboard/containers/DataSources/slice'
import { reducer as statisticsReducer } from '/react4xp/dashboard/containers/Statistics/slice'
import { reducer as jobsReducer } from '/react4xp/dashboard/containers/Jobs/slice'

import logger from 'redux-logger'

export function configureAppStore(toggleDebugging) {
  const reduxSagaMonitorOptions = {}
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions)
  const { run: runSaga } = sagaMiddleware

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware]

  if (toggleDebugging) {
    middlewares.push(logger)
  }

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ]

  const rootReducer = {
    common: commonReducer,
    statReg: statRegReducer,
    dataSources: dataSourcesReducer,
    statistics: statisticsReducer,
    jobs: jobsReducer,
  }

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares),
    devTools: process.env.NODE_ENV !== 'production',
    enhancers: (defaultEnhancers) => [...defaultEnhancers(), ...enhancers],
  })

  return store
}
