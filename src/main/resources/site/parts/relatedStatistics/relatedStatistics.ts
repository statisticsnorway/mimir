import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getContent, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { type Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { type RelatedStatisticsContent } from '/lib/types/partTypes/relatedStatistics'
import { type Statistics } from '/site/content-types'

const view = resolve('./relatedStatistics.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  const relatedStatistics: Statistics['relatedStatisticsOptions'] = page.data.relatedStatisticsOptions
  const phrases = getPhrases(page) as Phrases

  const statisticsTitle: string = phrases.menuStatistics
  if (!relatedStatistics || relatedStatistics.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics` && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          statisticsTitle,
        }),
      }
    }
  }

  return renderRelatedStatistics(
    req,
    statisticsTitle,
    parseRelatedContent(relatedStatistics ? util.data.forceArray(relatedStatistics) : []),
    phrases
  )
}

function renderRelatedStatistics(
  req: XP.Request,
  statisticsTitle: string,
  relatedStatisticsContent: Array<RelatedStatisticsContent>,
  phrases: Phrases
): XP.Response {
  if (relatedStatisticsContent && relatedStatisticsContent.length) {
    const id = 'related-statistics'
    const body: string = render(view, {
      relatedStatisticsId: id,
    })

    return r4xpRender(
      'StatisticsCards',
      {
        headerTitle: statisticsTitle,
        statistics: relatedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent,
          }
        }),
        showAll: phrases.showAll,
        showLess: phrases.showLess,
      },
      req,
      {
        id: id,
        body: body,
      }
    )
  }
  return {
    body: null,
    pageContributions: undefined,
  }
}

function parseRelatedContent(
  relatedStatistics: Statistics['relatedStatisticsOptions']
): Array<RelatedStatisticsContent> {
  if (relatedStatistics && relatedStatistics.length > 0) {
    return relatedStatistics
      .map((statistics) => {
        if (statistics._selected === 'xp') {
          const statisticsContentId: string | undefined = statistics.xp.contentId
          const relatedStatisticsContent: Content<Statistics> | null = statisticsContentId
            ? getContentByKey({
                key: statisticsContentId,
              })
            : null

          let preamble: string | undefined
          if (relatedStatisticsContent) {
            preamble = relatedStatisticsContent.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription
          }

          return {
            title: relatedStatisticsContent && relatedStatisticsContent.displayName,
            preamble: preamble ?? '',
            href: statisticsContentId
              ? pageUrl({
                  id: statisticsContentId,
                })
              : '',
          }
        }

        return {
          title: statistics.cms.title,
          preamble: statistics.cms.profiledText,
          href: statistics.cms.url,
        }
      })
      .filter((statistics) => !!statistics) as Array<RelatedStatisticsContent>
  }
  return []
}
