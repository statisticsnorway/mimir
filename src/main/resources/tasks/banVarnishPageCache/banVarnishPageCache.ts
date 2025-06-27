import * as taskLib from '/lib/xp/task'
import { request, HttpResponse } from '/lib/http-client'
import { type BanVarnishPageCache as BanVarnishPageCacheConfig } from '/tasks/banVarnishPageCache'

import * as util from '/lib/util'

export function run(params: BanVarnishPageCacheConfig): void {
  util.data.forceArray(params.pageIds).forEach((pageId) => {
    purgePageFromVarnish(pageId)
    taskLib.progress({
      info: 'sent purge page request to varnish',
    })
  })
}

export function purgePageFromVarnish(pageId: string): HttpResponse {
  const baseUrl: string = app.config?.['ssb.internal.serverside.baseUrl'] ?? 'https://ext-i.ssb.no'
  const response: HttpResponse = request({
    url: `${baseUrl}/xp_page_clear`,
    method: 'PURGE',
    headers: {
      'x-content-key': pageId,
    },
    connectionTimeout: 5000,
    readTimeout: 5000,
  })
  log.info(`Cleared page ${pageId} from Varnish. Result code: ${response.status} - and message: ${response.message}`)
  return response
}
