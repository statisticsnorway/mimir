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

import { HomePage } from '/react4xp/dashboard/containers/HomePage/index'
import WebsocketProvider, { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { configureAppStore } from '/react4xp/dashboard/store/configureStore'
import { requestStatuses } from '/react4xp/dashboard/containers/StatRegDashboard/actions'
import { requestStatistics, requestStatisticsSearchList } from '/react4xp/dashboard/containers/Statistics/actions'
import { actions as commonActions } from '/react4xp/dashboard/containers/HomePage/slice'
import { setUserServerSide, requestServerTime } from '/react4xp/dashboard/containers/HomePage/actions'
import { requestJobs } from '/react4xp/dashboard/containers/Jobs/actions'

type DashboardProps = DashboardRouterProps & {
  toggleDebugging?: unknown
}

function Dashboard(props: DashboardProps) {
  return (
    <Provider store={configureAppStore(props.toggleDebugging)}>
      <WebsocketProvider>
        <HelmetProvider>
          <DashboardRouter
            user={props.user}
            dashboardOptionsForUser={props.dashboardOptionsForUser}
            contentStudioBaseUrl={props.contentStudioBaseUrl}
            dataToolBoxBaseUrl={props.dataToolBoxBaseUrl}
            internalBaseUrl={props.internalBaseUrl}
            internalStatbankUrl={props.internalStatbankUrl}
            statregRapportUrl={props.statregRapportUrl}
            title={props.title}
          />
        </HelmetProvider>
      </WebsocketProvider>
    </Provider>
  )
}

interface DashboardRouterProps {
  user?: object
  dashboardOptionsForUser?: {
    dashboardTools?: boolean
    statistics?: boolean
    jobLogs?: boolean
    dataSources?: boolean
    statisticRegister?: boolean
  }
  contentStudioBaseUrl?: string
  dataToolBoxBaseUrl?: string
  internalBaseUrl?: string
  internalStatbankUrl?: string
  statregRapportUrl?: string
  title: string
}

function DashboardRouter(props: DashboardRouterProps) {
  // all initial fetches
  const dispatch = useDispatch()
  const io = React.useContext(WebSocketContext)
  io.setup(dispatch)
  dispatch({
    type: commonActions.setUser.type,
    user: props.user,
  })
  dispatch({
    type: commonActions.setDashboardOptions.type,
    dashboardOptions: props.dashboardOptionsForUser,
  })
  dispatch({
    type: commonActions.setContentStudioBaseUrl.type,
    contentStudioBaseUrl: props.contentStudioBaseUrl,
  })
  dispatch({
    type: commonActions.setDataToolBoxBaseUrl.type,
    dataToolBoxBaseUrl: props.dataToolBoxBaseUrl,
  })
  dispatch({
    type: commonActions.setInternalBaseUrl.type,
    internalBaseUrl: props.internalBaseUrl,
  })
  dispatch({
    type: commonActions.setStatregRapportUrl.type,
    statregRapportUrl: props.statregRapportUrl,
  })
  dispatch({
    type: commonActions.setInternalStatbankUrl.type,
    internalStatbankUrl: props.internalStatbankUrl,
  })
  setUserServerSide(dispatch, io, props.user)
  if (props.dashboardOptionsForUser.statistics) requestStatistics(dispatch, io)
  if (props.dashboardOptionsForUser.dashboardTools) requestStatisticsSearchList(dispatch, io)
  if (props.dashboardOptionsForUser.statisticRegister) requestStatuses(dispatch, io)
  if (props.dashboardOptionsForUser.jobLogs) requestJobs(dispatch, io)
  requestServerTime(dispatch, io)
  return (
    <BrowserRouter>
      <Helmet titleTemplate={props.title} defaultTitle={props.title}></Helmet>

      <Switch>
        <Route path='/' component={HomePage} />
      </Switch>
    </BrowserRouter>
  )
}

export default (props: DashboardRouterProps) => <Dashboard {...props} />
