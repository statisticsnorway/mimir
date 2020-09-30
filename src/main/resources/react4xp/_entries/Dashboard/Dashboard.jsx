/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Switch, Route, BrowserRouter } from 'react-router-dom'

import { HomePage } from './containers/HomePage/index'
import WebsocketProvider, { WebSocketContext } from './utils/websocket/WebsocketProvider'
import { configureAppStore } from './store/configureStore'
import { requestStatuses } from './containers/StatRegDashboard/actions'
import { requestDataQueries } from './containers/DataQueries/actions'

function Dashboard() {
  return (
    <Provider store={configureAppStore()}>
      <WebsocketProvider>
        <HelmetProvider>
          <React.StrictMode>
            <DashboardRouter/>
          </React.StrictMode>
        </HelmetProvider>
      </WebsocketProvider>
    </Provider>
  )
}

function DashboardRouter() {
  // all initial fetches
  const dispatch = useDispatch()
  const io = React.useContext(WebSocketContext)
  io.setup(dispatch)
  requestStatuses(dispatch, io)
  requestDataQueries(dispatch, io)
  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="SSB Dashboard desk"
        defaultTitle="SSB Dashboard desk"
      >
      </Helmet>

      <Switch>
        <Route path="/" component={HomePage} />
        {/* <Route component={HomePage} /> */}
      </Switch>
    </BrowserRouter>
  )
}

export default (props) => <Dashboard {...props} />
