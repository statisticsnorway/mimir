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
import { actions as commonActions } from './containers/HomePage/slice'
import PropTypes from 'prop-types'
import { setUserServerSide } from './containers/HomePage/actions.es6'

function Dashboard(props) {
  return (
    <Provider store={configureAppStore()}>
      <WebsocketProvider>
        <HelmetProvider>
          <DashboardRouter user={props.user}/>
        </HelmetProvider>
      </WebsocketProvider>
    </Provider>
  )
}

Dashboard.propTypes = {
  user: PropTypes.object
}

function DashboardRouter(props) {
  // all initial fetches
  const dispatch = useDispatch()
  const io = React.useContext(WebSocketContext)
  io.setup(dispatch)
  dispatch({
    type: commonActions.setUser.type,
    user: props.user
  })
  setUserServerSide(dispatch, io, props.user)
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
      </Switch>
    </BrowserRouter>
  )
}

DashboardRouter.propTypes = {
  user: PropTypes.object
}

export default (props) => <Dashboard {...props} />
