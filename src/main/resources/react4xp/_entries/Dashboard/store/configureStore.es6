import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'
import createSagaMiddleware from 'redux-saga'
import { createReducer } from './reducers'
import { reducer as statRegReducer } from '../containers/StatRegDashboard/slice'
import { reducer as commonReducer } from '../containers/HomePage/slice'
import { reducer as dataQueriesReducer } from '../containers/DataQueries/slice'
import { reducer as statisticsReducer } from '../containers/Statistics/slice'
import { reducer as jobsReducer } from '../containers/Jobs/slice'

export function configureAppStore() {
  const reduxSagaMonitorOptions = {}
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions)
  const {
    run: runSaga
  } = sagaMiddleware

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware]

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga
    })
  ]

  const store = configureStore({
    reducer: {
      common: commonReducer,
      statReg: statRegReducer,
      dataQueries: dataQueriesReducer,
      statistics: statisticsReducer,
      jobs: jobsReducer
    },
    middleware: [...getDefaultMiddleware(), ...middlewares],
    devTools: process.env.NODE_ENV !== 'production',
    enhancers
  })

  return store
}
