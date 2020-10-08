import { Socket, SocketEmitter } from '../types/socket'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/lib/content'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')

export function setupHandlers(socket: Socket, socketEmitter: SocketEmitter): void {
  socket.on('get-statistics', () => {
    let statistics: Array<unknown> = []
    const result: QueryResponse<Content> = query({
      contentTypes: [`${app.name}:statistics`],
      query: ``,
      count: 50
    })
    statistics = statistics.concat(result.hits)
    log.info('statistics PrettyJSON%s',JSON.stringify(statistics ,null,4));
    socket.emit('statistics-result', statistics)
  })
}
