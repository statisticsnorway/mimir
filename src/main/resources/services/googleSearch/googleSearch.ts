import { getSiteConfig } from '/lib/xp/portal'
import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'

export function get(req: XP.Request): XP.Response {
  const siteConfig: XP.SiteConfig = getSiteConfig()!

  const sortString: 'date' | 'relevance' = req.params.sort === 'date' ? 'date' : 'relevance'

  const requestParams: HttpRequestParams = {
    url: `https://www.googleapis.com/customsearch/v1`,
    method: 'get',
    contentType: 'application/json',
    connectionTimeout: 60000,
    readTimeout: 10000,
    params: {
      key: siteConfig.googleSearchApiKey,
      cx: siteConfig.googleSearchEngineId,
      q: req.params.q,
      sort: sortString === 'relevance' ? '' : sortString,
    },
  }

  const result: HttpResponse = request(requestParams)

  return {
    body: result.body,
    contentType: 'application/json',
    status: 200,
  }
}
