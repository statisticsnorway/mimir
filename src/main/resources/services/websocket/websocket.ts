import { openWebsockets, SocketEmitter } from '/lib/wsUtil'
import { setupHandlers as setupDashboardHandlers } from '/lib/ssb/dashboard/dashboard'
import { setupHandlers as setupStatregHandlers } from '/lib/ssb/dashboard/statreg'
import { setupHandlers as setupCacheHandlers } from '/lib/ssb/cache/cache'
import { setupHandlers as setupStatisticHandlers } from '/lib/ssb/dashboard/statistic'

openWebsockets(exports) // make the server ready for socket connections

// use SocketEmitter expansion to handle this
const socketEmitter = new SocketEmitter()

// handle socket connections
socketEmitter.connect(connectionCallback)

function connectionCallback(socket) {
  setupDashboardHandlers(socket, socketEmitter)
  setupStatregHandlers(socket, socketEmitter)
  setupStatisticHandlers(socket, socketEmitter)
  setupCacheHandlers(socket)

  socket.on('keep-alive', () => {
    socket.emit('keep-alive', 'pong')
  })
}
