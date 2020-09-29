export const ioWrapper = (wsConnection) => {
  if (!wsConnection) {
    wsConnection = new ExpWS()
  }
  const io = new wsConnection.Io()
  const connectionListeners = []
  const state = {
    isConnected: false,
    wsConnection,
    emit: io.emit,
    on: io.on
  }

  /**
     * @public
     * @param {string} key
     * @param {function} callback
     */
  const listenToConnectionEvent = function(key, callback) {
    connectionListeners.push({
      key,
      callback
    })
  }

  /**
     * @private
     * @param {object} event
     */
  const onConnectionOpen = function(event) {
    connectionListeners.forEach((l) => {
      if (l.key === 'open') {
        l.callback(event)
      }
    })

    // keep-alive for socket (or it will timeout and stop working after 5 minutes)
    setInterval(() => {
      io.emit('keep-alive', 'ping')
    }, 1000 * 60 * 3)
  }

  /**
     * @private
     * @param {object} event
     */
  const onConnectionClose = function(event) {
    connectionListeners.forEach((l) => {
      if (l.key === 'close') {
        l.callback(event)
      }
    })
  }

  // listen to open and close ws connection, so we can tell the user they have disconnected
  wsConnection.setEventHandler('close', (event) => {
    state.isConnected = false
    onConnectionClose(event)
  })

  wsConnection.setEventHandler('open', (event) => {
    state.isConnected = true
    onConnectionOpen(event)
  })

  return Object.assign(state, {
    listenToConnectionEvent
  })
}

