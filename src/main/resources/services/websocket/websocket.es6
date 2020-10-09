const ws = __non_webpack_require__('/lib/wsUtil')
const dashboard = __non_webpack_require__('/lib/ssb/dataset/dashboard')
const statreg = __non_webpack_require__('/lib/ssb/statreg')
const cache = __non_webpack_require__('/lib/ssb/cache')

ws.openWebsockets(exports) // make the server ready for socket connections

// use SocketEmitter expansion to handle this
const socketEmitter = new ws.SocketEmitter()

// handle socket connections
socketEmitter.connect(connectionCallback)

function connectionCallback(socket) {
  dashboard.setupHandlers(socket, socketEmitter)
  statreg.setupHandlers(socket, socketEmitter)
  cache.setupHandlers(socket)

  socket.on('keep-alive', () => {
    socket.emit('keep-alive', 'pong')
  })
}
