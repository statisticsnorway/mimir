// source: https://raw.githubusercontent.com/enonic/starter-tsup/2d08bf54ef3d3b4a037e579c0ed3a7c7c1f9272c/src/main/resources/lib/browserSync.ts

import { newCache } from '/lib/cache'
import { request as httpClientRequest } from '/lib/http-client'

const isRunningCache = newCache({
  size: 1,
  expire: 10,
})

export function getBrowserSyncUrl({ request }: { request: XP.Request }): string {
  const { host, scheme } = request
  return `${scheme}://${host}:${process.env.BROWSER_SYNC_PORT}/browser-sync/browser-sync-client.js`
}

export function isRunning({ request }: { request: XP.Request }): boolean {
  return isRunningCache.get('hardcoded-cache-key', () => {
    try {
      const requestParameters = {
        url: getBrowserSyncUrl({ request }),
        method: 'HEAD',
        // headers: {
        // 	'Cache-Control': 'no-cache'
        // },
        connectionTimeout: 1000,
        readTimeout: 1000,
      }
      const response = httpClientRequest(requestParameters)
      if (response.status !== 200) {
        log.info(
          'Response status not 200 when checking for BrowserSync request:%s response:%s',
          JSON.stringify(requestParameters, null, 2),
          JSON.stringify(response, null, 2)
        )
        return false
      }
      return true
    } catch (e) {
      return false
    }
  })
}

export function getBrowserSyncScript({ request }: { request: XP.Request }): string {
  return `<script src="${getBrowserSyncUrl({ request })}"></script>`
}
