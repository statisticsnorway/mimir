export function setupHandlers(socket: Socket): void {
  socket.on('convert-key-figure-start', () => {
    log.info('start keyFigure convert')
    socket.emit('convert-key-figure-update', {
      key: 'convert-key-figure',
      current: 30
    })
  })
}

export interface Socket {
  on: (event: string, handler: () => void) => void;
  emit: (event: string, data: string | object) => void;
}
