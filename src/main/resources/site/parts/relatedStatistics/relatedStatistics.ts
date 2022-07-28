import { get, Content } from '/lib/xp/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Statistics } from '../../content-types/statistics/statistics'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getContent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./relatedStatistics.html')

exports.get = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const page: Content<Statistics> = getContent()
  const relatedStatistics: Statistics['relatedStatisticsOptions'] = page.data.relatedStatisticsOptions
  const phrases: Phrases = getPhrases(page)

  const statisticsTitle: string = phrases.menuStatistics
  if (!relatedStatistics || relatedStatistics.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics` && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          statisticsTitle
        })
      }
    }
  }

  return renderRelatedStatistics(statisticsTitle, parseRelatedContent(relatedStatistics ? forceArray(relatedStatistics) : []), phrases)
}

function renderRelatedStatistics(statisticsTitle: string, relatedStatisticsContent: Array<RelatedStatisticsContent>, phrases: Phrases): XP.Response {
  if (relatedStatisticsContent && relatedStatisticsContent.length) {
    const relatedStatisticsXP: React4xpObject = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: relatedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        showAll: phrases.showAll,
        showLess: phrases.showLess
      })
      .uniqueId()

    const body: string = render(view, {
      relatedStatisticsId: relatedStatisticsXP.react4xpId,
      label: statisticsTitle
    })

    return {
      body: relatedStatisticsXP.renderBody({
        body
      }),
      pageContributions: relatedStatisticsXP.renderPageContributions() as XP.PageContributions
    }
  }
  return {
    body: null,
    pageContributions: undefined
  }
}

function parseRelatedContent(relatedStatistics: Statistics['relatedStatisticsOptions']): Array<RelatedStatisticsContent> {
  if (relatedStatistics && relatedStatistics.length > 0) {
    return relatedStatistics.map((statistics) => {
      if (statistics._selected === 'xp') {
        const statisticsContentId: string | undefined = statistics.xp.contentId
        const relatedStatisticsContent: Content<Statistics, object, SEO> | null = statisticsContentId ? get({
          key: statisticsContentId
        }) : null

        let preamble: string | undefined
        if (relatedStatisticsContent && hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], relatedStatisticsContent)) {
          preamble = relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: relatedStatisticsContent && relatedStatisticsContent.displayName,
          preamble: preamble ? preamble : '',
          href: statisticsContentId ? pageUrl({
            id: statisticsContentId
          }) : ''
        }
      }

      return {
        title: statistics.cms.title,
        preamble: statistics.cms.profiledText,
        href: statistics.cms.url
      }
    }).filter((statistics) => !!statistics) as Array<RelatedStatisticsContent>
  }
  return []
}

interface RelatedStatisticsContent {
  title: string;
  preamble: string;
  href: string;
}
