/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react'
import { Provider } from 'react-redux'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Switch, Route, BrowserRouter } from 'react-router-dom'

import { HomePage } from './containers/HomePage/index'
import { configureAppStore } from './store/configureStore.es6'

function Dashboard() {
  return (
    <Provider store={configureAppStore()}>
      <HelmetProvider>
        <React.StrictMode>
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
        </React.StrictMode>
      </HelmetProvider>
    </Provider>
  )
}


export default (props) => <Dashboard {...props} />
