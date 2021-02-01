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
import { requestStatistics } from './containers/Statistics/actions'
import { actions as commonActions } from './containers/HomePage/slice'
import PropTypes from 'prop-types'
import { setUserServerSide } from './containers/HomePage/actions'
import { requestJobs } from './containers/Jobs/actions'

function Dashboard(props) {
  return (
    <Provider store={configureAppStore()}>
      <WebsocketProvider>
        <HelmetProvider>
          <DashboardRouter user={props.user} contentStudioBaseUrl={props.contentStudioBaseUrl} dataToolBoxBaseUrl={props.dataToolBoxBaseUrl}
            internalBaseUrl={props.internalBaseUrl} internalStatbankUrl={props.internalStatbankUrl} />
        </HelmetProvider>
      </WebsocketProvider>
    </Provider>
  )
}

Dashboard.propTypes = {
  user: PropTypes.object,
  contentStudioBaseUrl: PropTypes.string,
  dataToolBoxBaseUrl: PropTypes.string,
  internalBaseUrl: PropTypes.string,
  internalStatbankUrl: PropTypes.string
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
  dispatch({
    type: commonActions.setContentStudioBaseUrl.type,
    contentStudioBaseUrl: props.contentStudioBaseUrl
  })
  dispatch({
    type: commonActions.setDataToolBoxBaseUrl.type,
    dataToolBoxBaseUrl: props.dataToolBoxBaseUrl
  })
  dispatch({
    type: commonActions.setInternalBaseUrl.type,
    internalBaseUrl: props.internalBaseUrl
  })
  dispatch({
    type: commonActions.setInternalStatbankUrl.type,
    internalStatbankUrl: props.internalStatbankUrl
  })
  setUserServerSide(dispatch, io, props.user)
  requestStatistics(dispatch, io)
  // requestStatuses(dispatch, io)
  // requestDataQueries(dispatch, io)
  // requestJobs(dispatch, io)
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
  user: PropTypes.object,
  contentStudioBaseUrl: PropTypes.string,
  dataToolBoxBaseUrl: PropTypes.string,
  internalBaseUrl: PropTypes.string,
  internalStatbankUrl: PropTypes.string
}

export default (props) => <Dashboard {...props} />
