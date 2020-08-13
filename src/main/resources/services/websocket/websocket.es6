const ws = __non_webpack_require__('/lib/wsUtil')
const convert = __non_webpack_require__('/lib/convert/convert')

ws.openWebsockets(exports) // make the server ready for socket connections

// use SocketEmitter expansion to handle this
const socketEmitter = new ws.SocketEmitter()

// handle socket connections
socketEmitter.connect(connectionCallback)

function connectionCallback(socket) {
  log.info(JSON.stringify(socket, null, 2))
  convert.setupHandlers(socket)
}
