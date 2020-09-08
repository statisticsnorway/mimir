const { run } = __non_webpack_require__('/lib/xp/context')
const ws = __non_webpack_require__('/lib/wsUtil')
const convert = __non_webpack_require__('/lib/convert/convert')
const dashboard = __non_webpack_require__('/lib/ssb/dataset/dashboard')
const auth = __non_webpack_require__('/lib/xp/auth')
ws.openWebsockets(exports) // make the server ready for socket connections

// use SocketEmitter expansion to handle this
const socketEmitter = new ws.SocketEmitter()

// handle socket connections
socketEmitter.connect(connectionCallback)

const users = []

function connectionCallback(socket) {
  convert.setupHandlers(socket)
  dashboard.setupHandlers(socket, socketEmitter)

  socket.on('keep-alive', () => {
    socket.emit('keep-alive', 'pong')
  })
}
