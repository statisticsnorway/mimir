import { query, ContentsResult, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { isEnabled } from '/lib/featureToggle'
import { sanitizeQuery } from '/lib/ssb/utils/nameSearchUtils'
import { getAssociatedStatisticsLinks } from '/lib/ssb/utils/articleUtils'
import { Article } from '/site/content-types'

export const get = (req: XP.Request): XP.Response => {
  const gptServiceEnabled: boolean = isEnabled('gpt-service', false, 'ssb')
  if (gptServiceEnabled) {
    const searchTerm = req.params.query ? sanitizeQuery(req.params.query) : ''
    const count = Number(req.params.count) ? Number(req.params.count) : 10
    const start = Number(req.params.start) ? Number(req.params.start) : 0

    const result: ContentsResult<Content<Article>> = query({
      start: start,
      count: count,
      sort: 'modifiedTime DESC',
      query: {
        fulltext: {
          fields: ['data.articleText', 'displayName'],
          query: decodeURI(searchTerm).split(' ').join('~2 ') + '~2', // Gives us levensthein distance of 2
          operator: 'OR',
        },
      },
      contentTypes: ['mimir:article'],
    })

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        result: result.hits.map((hit) => {
          return {
            publishDate: hit.publish?.first,
            title: hit.displayName,
            url: pageUrl({
              id: hit._id,
              type: 'absolute',
            }),
            associatedStatistics: getAssociatedStatisticsLinks(hit.data.associatedStatistics),
            ingress: hit.data.ingress,
            articleText: hit.data.articleText,
          }
        }),
      },
    }
  } else {
    return {
      status: 404,
    }
  }
}
