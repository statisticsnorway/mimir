import { type getContent as getContentType, type imageUrl as imageUrlType } from '@enonic-types/lib-portal'

import { App, LibContent, LibPortal, Server } from '@enonic/mock-xp'
import { jest } from '@jest/globals'
import { type Log } from '@enonic-types/core'

export { Request } from '@enonic/mock-xp'

const APP_KEY = 'mimir'
const PROJECT_NAME = 'mimir'

export const server = new Server({
  loglevel: 'debug',
})
  .createProject({
    projectName: PROJECT_NAME,
  })
  .setContext({
    projectName: PROJECT_NAME,
  })

// Avoid type errors below.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  let log: Log
}

globalThis.log = server.log as Log

const app = new App({
  key: APP_KEY,
})

export const libContent = new LibContent({
  server,
})

export const libPortal = new LibPortal({
  app,
  server,
})

jest.mock(
  '/lib/xp/portal',
  () => {
    return {
      getContent: jest.fn<typeof getContentType>(() => libPortal.getContent()),
      imageUrl: jest.fn<typeof imageUrlType>((params) => libPortal.imageUrl(params)),
    }
  },
  { virtual: true }
)
