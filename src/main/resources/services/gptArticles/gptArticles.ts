import { query, get as getContentByKey, ContentsResult, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { isEnabled } from '/lib/featureToggle'
import { sanitizeQuery } from '/lib/ssb/utils/nameSearchUtils'
import { Article } from '/site/content-types'

export const get = (req: XP.Request): XP.Response => {
  const gptServiceEnabled: boolean = isEnabled('gpt-service', false, 'ssb')
  if (gptServiceEnabled) {
    const searchTerm = req.params.query ? sanitizeQuery(req.params.query) : ''
    log.info(`queryParam: ${searchTerm}`)
    const count = Number(req.params.count) ? Number(req.params.count) : 10
    const start = Number(req.params.start) ? Number(req.params.start) : 0

    const result2: ContentsResult<Content<Article>> = query({
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
        result: result2.hits.map((hit) => {
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

function getAssociatedStatisticsLinks(
  associatedStatisticsConfig: Article['associatedStatistics']
): Array<AssociatedLink> | [] {
  if (associatedStatisticsConfig && associatedStatisticsConfig.length) {
    return associatedStatisticsConfig
      .map((option) => {
        if (option?._selected === 'XP') {
          const associatedStatisticsXP: string | undefined = option.XP?.content
          const associatedStatisticsXPContent: Content | null = associatedStatisticsXP
            ? getContentByKey({
                key: associatedStatisticsXP,
              })
            : null

          if (associatedStatisticsXPContent) {
            return {
              text: associatedStatisticsXPContent.displayName,
              href: associatedStatisticsXP
                ? pageUrl({
                    path: associatedStatisticsXPContent._path,
                    type: 'absolute',
                  })
                : '',
            }
          }
        } else if (option?._selected === 'CMS') {
          const associatedStatisticsCMS: CMS | undefined = option.CMS
          return {
            text: associatedStatisticsCMS?.title,
            href: 'https://www.ssb.no' + associatedStatisticsCMS?.href,
          }
        }
        return
      })
      .filter((statistics) => !!statistics) as Array<AssociatedLink>
  }
  return []
}

interface AssociatedLink {
  text?: string
  href?: string
}

interface CMS {
  href?: string
  title?: string
}
