import { query, ContentsResult, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { isEnabled } from '/lib/featureToggle'
import { Statistics } from '/site/content-types'

export const get = (req: XP.Request): XP.Response => {
  const gptServiceEnabled: boolean = isEnabled('gpt-service', false, 'ssb')
  if (gptServiceEnabled) {
    const searchTerm = req.params.query ? parseInt(req.params.query) : 0
    const count = Number(req.params.count) ? Number(req.params.count) : 10
    const start = Number(req.params.start) ? Number(req.params.start) : 0

    if (Object.keys(req.params).length == 0) {
      // If no query parameters are given, return a 400 with instructions
      return {
        status: 400,
        contentType: 'application/json',
        body: {
          message: 'Missing query parameter. Example: ?query=2334&count=10&start=0',
        },
      }
    }

    const result: ContentsResult<Content<Statistics>> = query({
      start: start,
      count: count,
      sort: 'modifiedTime DESC',
      query: `data.statistic = "${searchTerm}"`,
      contentTypes: ['mimir:statistics'],
    })

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        agg: result.hits.map((hit) => {
          return {
            title: hit.displayName,
            url: pageUrl({
              id: hit._id,
              type: 'absolute',
            }),
            mainTable: pageUrl({
              id: hit.data.mainTable ?? '',
              type: 'absolute',
            }),
            statbankLinkItemSet: hit.data.statbankLinkItemSet,
          }
        }),
        result,
      },
    }
  } else {
    return {
      status: 404,
    }
  }
}
