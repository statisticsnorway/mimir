export interface Socket {
  id: string
  on: (event: string, handler: (options: object | undefined | string) => void) => void
  emit: (event: string, data: string | object | number) => void
}

export interface SocketEmitter {
  broadcast: (event: string, data: string | object) => void
}
