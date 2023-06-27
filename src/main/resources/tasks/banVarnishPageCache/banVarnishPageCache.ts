import { request, HttpResponse } from '/lib/http-client'
import type { BanVarnishPageCache as BanVarnishPageCacheConfig } from '/tasks/banVarnishPageCache'

const taskLib = __non_webpack_require__('/lib/xp/task')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

exports.run = function (params: BanVarnishPageCacheConfig): void {
  forceArray(params.pageIds).forEach((pageId) => {
    const result: HttpResponse = purgePageFromVarnish(pageId)
    taskLib.progress({
      info: 'sendt purge page request to varnish',
    })

    // Keeping log line, want to monitor this for a while
    log.info(`Cleared single page from Varnish. Result code: ${result.status} - and message: ${result.message}`)
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
