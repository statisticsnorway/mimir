import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import { actions as commonActions } from '../../containers/HomePage/slice'
import { actions as statRegActions } from '../../containers/StatRegDashboard/slice'

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
        if (pingInterval) {
          clearInterval(pingInterval)
          pingInterval = undefined
        }
      })

      wsConnection.setEventHandler('open', (event) => {
        dispatch({
          type: commonActions.onConnect.type
        })
        if (!pingInterval) {
          pingInterval = setInterval(() => {
            io.emit('keep-alive', 'ping')
          }, 1000 * 60 * 3)
        }

        io.on('statreg-dashboard-status-result', (data) => {
          dispatch({
            type: statRegActions.statusesLoaded.type,
            statuses: data
          })
        })

        io.on('statreg-dashboard-refresh-result', (data) => {
          dispatch({
            type: statRegActions.resultRefreshStatus.type,
            status: data
          })
        })

        io.on('statreg-dashboard-refresh-start', (key) => {
          dispatch({
            type: statRegActions.startRefreshStatus.type,
            keys: [key]
          })
        })

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
