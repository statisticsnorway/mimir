import { Response } from 'enonic-types/controller'
import { BanVarnishPageCacheConfig } from './banVarnishPageCache-config'

const taskLib = __non_webpack_require__('/lib/xp/task')

const {
  request
} = __non_webpack_require__('/lib/http-client')


exports.run = function(params: BanVarnishPageCacheConfig ): void {
  const result: Response = purgePageFromVarnish(params.pageId as string)
  taskLib.progress({
    info: 'sendt purge page request to varnish'
  })

  log.info(result.status)
}

function purgePageFromVarnish(pageId: string): Response {
  const baseUrl: string = app.config && app.config['ssb.internal.baseUrl'] ? app.config['ssb.internal.baseUrl'] as string : 'https://i.ssb.no'
  const response: Response = request({
    url: `${baseUrl}/xp_page_clear`,
    method: 'PURGE',
    headers: {
      'x-content-key': pageId
    },
    connectionTimeout: 5000,
    readTimeout: 5000
  })
  return response
}
