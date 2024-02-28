import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent, pageUrl } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { EndedStatistic } from '/lib/types/partTypes/endedStatistics'
import { type Statistics } from '/site/content-types'
import { type EndedStatistics as EndedStatisticsPartConfig } from '.'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const part = getComponent<XP.PartComponent.EndedStatistics>()?.config
  if (!part) throw Error('No part config found')

  const endedStatistics: EndedStatisticsPartConfig['relatedStatisticsOptions'] = part.relatedStatisticsOptions
    ? util.data.forceArray(part.relatedStatisticsOptions)
    : []

  const phrases: Phrases = getPhrases(page) as Phrases

  return renderEndedStatistics(req, parseContent(endedStatistics), phrases)
}

function renderEndedStatistics(
  req: XP.Request,
  endedStatisticsContent: Array<EndedStatistic@@ | undefined>,
  phrases: Phrases
) {
  if (endedStatisticsContent && endedStatisticsContent.length) {
    return render(
      'EndedStatistics',
      {
        endedStatistics: endedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent,
          }
        }),
        iconText: phrases.endedCardText,
        buttonText: phrases.endedStatistics,
      },
      req,
      {
        body: '<section class="xp-part part-ended-statistics"></section>',
      }
    )
  } else {
    return {
      body: '',
      pageContributions: {},
    }
  }
}

function parseContent(
  endedStatistics: EndedStatisticsPartConfig['relatedStatisticsOptions']
): Array<EndedStatistic | undefined> {
  if (endedStatistics && endedStatistics.length) {
    return endedStatistics
      .map((statistics) => {
        if (statistics._selected === 'xp' && statistics.xp.contentId) {
          const statisticsContentId: string = statistics.xp.contentId
          const endedStatisticsContent: Content<Statistics> | null = statisticsContentId
            ? getContentByKey({
                key: statisticsContentId,
              })
            : null

          const preamble = endedStatisticsContent?.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription

          return {
            title: endedStatisticsContent ? endedStatisticsContent.displayName : '',
            preamble: preamble ?? '',
            href: pageUrl({
              id: statisticsContentId,
            }),
          }
        } else if (statistics._selected === 'cms') {
          return {
            title: statistics.cms.title,
            preamble: statistics.cms.profiledText,
            href: statistics.cms.url,
          }
        } else return undefined
      })
      .filter((statistics) => !!statistics)
  } else return []
}
