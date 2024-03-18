import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import { actions as commonActions } from '/react4xp/dashboard/containers/HomePage/slice'
import setupStatRegListeners from '/react4xp/dashboard/containers/StatRegDashboard/listeners'
import setupHomePageListeners from '/react4xp/dashboard/containers/HomePage/listeners'
import setupDataSourcesListeners from '/react4xp/dashboard/containers/DataSources/listeners'
import setupStatisticsListeners from '/react4xp/dashboard/containers/Statistics/listeners'
import setupJobsListeners from '/react4xp/dashboard/containers/Jobs/listeners'

const WebSocketContext = createContext(null)
export { WebSocketContext }

function WebsocketProvider({ children }) {
  let io
  let wsConnection
  let pingInterval
  let provider
  let emitQueue = []
  let connectionStatus = 'closed'
  // dummy emit function that adds emits to a waiting queue before the socket connection is open
  function addEmitQueue(key, data) {
    emitQueue.push({
      key,
      data,
    })
  }

  if (!provider) {
    function setup(dispatch) {
      wsConnection = new ExpWS()
      function closeConnection() {
        provider.emit = addEmitQueue
        dispatch({
          type: commonActions.onDisconnect.type,
        })

        // remove keep alive
        if (pingInterval) {
          clearInterval(pingInterval)
          pingInterval = undefined
        }
      }
      // listen to open and close ws connection, so we can tell the user they have disconnected
      wsConnection.setEventHandler('close', () => closeConnection())

      wsConnection.setEventHandler('open', () => {
        dispatch({
          type: commonActions.onConnect.type,
        })
        // setup keep alive
        if (!pingInterval) {
          pingInterval = setInterval(() => {
            if (connectionStatus !== 'pending') {
              connectionStatus = 'pending'
              io.emit('keep-alive', 'ping')
            } else {
              connectionStatus = 'closed'
              closeConnection()
            }
          }, 1000 * 20)
        }

        // setup store listeners
        setupStatRegListeners(io, dispatch)
        setupHomePageListeners(io, dispatch)
        setupDataSourcesListeners(io, dispatch)
        setupStatisticsListeners(io, dispatch)
        setupJobsListeners(io, dispatch)

        io.on('keep-alive', () => {
          connectionStatus = 'connected'
        })

        // run all emits waiting in queue
        emitQueue.forEach((q) => {
          io.emit(q.key, q.data)
        })
        emitQueue = []
        provider.emit = io.emit
      })

      io = new wsConnection.Io()
    }

    provider = {
      emit: addEmitQueue,
      setup,
    }
  }

  return <WebSocketContext.Provider value={provider}>{children}</WebSocketContext.Provider>
}

WebsocketProvider.propTypes = {
  children: PropTypes.any,
}

export default (props) => <WebsocketProvider {...props} />
