import { query, get as getContent, ContentsResult, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { isEnabled } from '/lib/featureToggle'
import { Statistics } from '/site/content-types'

// import { getContent } from '/lib/xp/portal'

export const get = (req: XP.Request): XP.Response => {
  const gptServiceEnabled: boolean = isEnabled('gpt-service', false, 'ssb')
  if (gptServiceEnabled) {
    const searchTerm = req.params.query ? parseInt(req.params.query) : 0
    log.info(`queryParam: ${searchTerm}`)
    const count = Number(req.params.count) ? Number(req.params.count) : 10
    const start = Number(req.params.start) ? Number(req.params.start) : 0

    // Query content using aggregations.
    const result: ContentsResult<Content<Statistics>> = query({
      start: start,
      count: count,
      sort: 'modifiedTime DESC',
      query: `data.statistic = "${searchTerm}"`,
      contentTypes: ['mimir:statistics'],
    })

    const mainTable = getContent

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        agg: result.hits.map((hit) => {
          return {
            title: hit.displayName,
            url:
              'https://www.ssb.no' +
              pageUrl({
                id: hit._id,
                // type: 'absolute',
              }),
            mainTable:
              'https://www.ssb.no' +
              pageUrl({
                id: hit.data.mainTable ?? '',
              }),
              sourceTable:
            statbankLinkItemSet: hit.data.statbankLinkItemSet,
          }
        }),
        result,
        // result: result2.hits.map((hit) => {
        //   return {
        //     title: hit.displayName,
        //     url:
        //       'https://www.ssb.no' +
        //       pageUrl({
        //         id: hit._id,
        //         // type: 'absolute',
        //       }),
        //     associatedStatistics: getAssociatedStatisticsLinks(hit.data),
        //   }
        // }),
      },
    }
  } else {
    return {
      status: 404,
    }
  }
}
