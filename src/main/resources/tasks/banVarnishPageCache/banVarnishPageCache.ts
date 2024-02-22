import * as taskLib from '/lib/xp/task'
import { request, HttpResponse } from '/lib/http-client'
import { type BanVarnishPageCache as BanVarnishPageCacheConfig } from '/tasks/banVarnishPageCache'

import * as util from '/lib/util'

export function run(params: BanVarnishPageCacheConfig): void {
  util.data.forceArray(params.pageIds).forEach((pageId) => {
    const result: HttpResponse = purgePageFromVarnish(pageId)
    taskLib.progress({
      info: 'sent purge page request to varnish',
    })

    // Keeping log line, want to monitor this for a while
    log.info(
      `Cleared page ${params.pageIds} from Varnish. Result code: ${result.status} - and message: ${result.message}`
    )
  })
}

function purgePageFromVarnish(pageId: string): HttpResponse {
  const baseUrl: string = app.config?.['ssb.internal.baseUrl']
    ? (app.config['ssb.internal.baseUrl'] as string)
    : 'https://i.ssb.no'
  const response: HttpResponse = request({
    url: `${baseUrl}/xp_page_clear`,
    method: 'PURGE',
    headers: {
      'x-content-key': pageId,
    },
    connectionTimeout: 5000,
    readTimeout: 5000,
  })
  return response
}
