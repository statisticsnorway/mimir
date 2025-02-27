import { query, ContentsResult, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { isEnabled } from '/lib/featureToggle'
import { sanitizeQuery } from '/lib/ssb/utils/nameSearchUtils'
import { getAssociatedStatisticsLinks } from '/lib/ssb/utils/articleUtils'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { Article } from '/site/content-types'

export const get = (req: XP.Request): XP.Response => {
  const gptServiceEnabled: boolean = isEnabled('gpt-service', false, 'ssb')
  if (gptServiceEnabled) {
    const searchTerm = req.params.query ? sanitizeQuery(req.params.query) : ''
    const count = Number(req.params.count) ? Number(req.params.count) : 10
    const start = Number(req.params.start) ? Number(req.params.start) : 0
    enum operator {
      AND = 'AND',
      OR = 'OR',
    }

    if (Object.keys(req.params).length == 0) {
      // If no query parameters are given, return a 400 with instructions
      return {
        status: 400,
        contentType: 'application/json',
        body: {
          message: 'Missing query parameter. Example: ?query=population%20density&count=10&start=0&operator=AND',
        },
      }
    }

    const result: ContentsResult<Content<Article>> = query({
      start: start,
      count: count,
      sort: 'modifiedTime DESC',
      query: {
        fulltext: {
          fields: ['data.articleText', 'displayName'],
          query: decodeURI(searchTerm).split(' ').join('~1 ') + '~1', // Gives us levensthein distance of 2
          operator: req.params.operator == operator.AND ? operator.AND : operator.OR,
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
            associatedStatistics: getAssociatedStatisticsLinks(ensureArray(hit.data.associatedStatistics)),
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
