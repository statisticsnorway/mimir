export declare function openWebsockets(exports: object): void

export declare class SocketEmitter {
  connect(callback: (socket: Socket) => void): void
  broadcast: (event: string, data: string | object) => void
}

export interface Socket {
  id: string
  on: (event: string, handler: (options: object | undefined | string) => void) => void
  emit: (event: string, data: string | object | number) => void
}
