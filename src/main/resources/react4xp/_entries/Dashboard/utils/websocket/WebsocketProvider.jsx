import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import { actions as commonActions } from '../../containers/HomePage/slice'
import setupStatRegListeners from '../../containers/StatRegDashboard/listeners'
import setupHomePageListeners from '../../containers/HomePage/listeners'
import setupDataQuieriesListeners from '../../containers/DataQueries/listeners'

const WebSocketContext = createContext(null)
export { WebSocketContext }

function WebsocketProvider({
  children
}) {
  let io
  let wsConnection
  let pingInterval
  let provider
  let emitQueue = []

  // dummy emit function that adds emits to a waiting queue before the socket connection is open
  function addEmitQueue(key, data) {
    emitQueue.push({
      key,
      data
    })
  }

  if (!provider) {
    function setup(dispatch) {
      wsConnection = new ExpWS()
      // listen to open and close ws connection, so we can tell the user they have disconnected
      wsConnection.setEventHandler('close', (event) => {
        provider.emit = addEmitQueue
        dispatch({
          type: commonActions.onDisconnect.type
        })

        // remove keep alive
        if (pingInterval) {
          clearInterval(pingInterval)
          pingInterval = undefined
        }
      })

      wsConnection.setEventHandler('open', (event) => {
        dispatch({
          type: commonActions.onConnect.type
        })
        // setup keep alive
        if (!pingInterval) {
          pingInterval = setInterval(() => {
            io.emit('keep-alive', 'ping')
          }, 1000 * 60 * 3)
        }

        // setup store listeners
        setupStatRegListeners(io, dispatch)
        setupHomePageListeners(io, dispatch)
        setupDataQuieriesListeners(io, dispatch)

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
      setup
    }
  }

  return (
    <WebSocketContext.Provider value={provider}>
      {children}
    </WebSocketContext.Provider>
  )
}

WebsocketProvider.propTypes = {
  children: PropTypes.any
}

export default (props) => <WebsocketProvider {...props}/>
