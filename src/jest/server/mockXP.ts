import { App, LibContent, LibPortal, Server } from '@enonic/mock-xp'
import { Content, type Log } from '@enonic-types/core'
import {
  type assetUrl as assetUrlType,
  type getContent as getContentType,
  type imageUrl as imageUrlType,
  type imagePlaceholder as imagePlaceholderType,
} from '@enonic-types/lib-portal'
import { type get as getType } from '@enonic-types/lib-content'
import { jest } from '@jest/globals'

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
      assetUrl: jest.fn<typeof assetUrlType>((params) => mockLibPortal.assetUrl(params)),
      getContent: jest.fn<typeof getContentType>(() => mockLibPortal.getContent()),
      imageUrl: jest.fn<typeof imageUrlType>((params) => mockLibPortal.imageUrl(params)),
      // imagePlaceholder: jest.fn<typeof imagePlaceholderType>((params) => libPortal.imagePlaceholder(params)),
    }
  },
  { virtual: true }
)

jest.mock(
  '/lib/xp/content',
  () => {
    return {
      get: jest.fn<typeof getType>((params) => mockLibContent.get(params)),
    }
  },
  { virtual: true }
)
