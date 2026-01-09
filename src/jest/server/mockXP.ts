import { App, LibContent, LibNode, LibPortal, LibRepo, Server } from '@enonic/mock-xp'
import { type Log } from '@enonic-types/core'
import { type getContent as getContentType, type imageUrl as imageUrlType } from '@enonic-types/lib-portal'
import { type get as getType } from '@enonic-types/lib-content'
import { jest } from '@jest/globals'
import { type create, type get } from '@enonic-types/lib-repo'

// Setting up mock server
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

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  let log: Log
}

globalThis.log = server.log as Log

const app = new App({
  key: APP_KEY,
})

export const mockLibContent = new LibContent({
  server,
})

// MOCK LIB CONTENT

jest.mock(
  '/lib/xp/content',
  () => {
    return {
      get: jest.fn<typeof getType>((params) => mockLibContent.get(params)),
    }
  },
  { virtual: true }
)

// MOCK LIB PORTAL

export const mockLibPortal = new LibPortal({
  app,
  server,
})

mockLibPortal.request = {
  host: 'localhost',
  path: '/',
  port: 80,
  scheme: 'http',
  contentPath: () => '/',
} as unknown as LibPortal['request']

jest.mock(
  '/lib/xp/portal',
  () => {
    return {
      getContent: jest.fn<typeof getContentType>(() => mockLibPortal.getContent()),
      imageUrl: jest.fn<typeof imageUrlType>((params) => mockLibPortal.imageUrl(params)),
    }
  },
  { virtual: true }
)

// MOCK LIB REPO

const mockLibRepo = new LibRepo({ server })

export const mockStatregRepo = mockLibRepo.create({ id: 'no.ssb.statreg' })

jest.mock(
  '/lib/xp/repo',
  () => {
    return {
      get: jest.fn<typeof get>((key) => mockLibRepo.get(key)),
      create: jest.fn<typeof create>((content) => mockLibRepo.create(content)),
    }
  },
  { virtual: true }
)

// MOCK LIB NODE

export const mockLibNode = new LibNode({ server })

export const mockStatregConn = mockLibNode.connect({ repoId: 'no.ssb.statreg', branch: 'master' })
