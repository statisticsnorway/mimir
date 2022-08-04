import { get, Content } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { Phrases } from '../../../lib/types/language'
import { render as r4xpRender, RenderResponse } from '/lib/enonic/react4xp'
import { SEO } from '../../../services/news/news'
import { Statistics } from '../../content-types/statistics/statistics'
import { DefaultPageConfig } from '../../pages/default/default-page-config'

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

  return renderRelatedStatistics(req, statisticsTitle, parseRelatedContent(relatedStatistics ? forceArray(relatedStatistics) : []), phrases)
}

function renderRelatedStatistics(req: XP.Request,
  statisticsTitle: string,
  relatedStatisticsContent: Array<RelatedStatisticsContent>,
  phrases: Phrases): XP.Response {
  if (relatedStatisticsContent && relatedStatisticsContent.length) {
    const body: string = render(view, {
      label: statisticsTitle
    })

    return r4xpRender('StatisticsCards',
      {
        headerTitle: statisticsTitle,
        statistics: relatedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        showAll: phrases.showAll,
        showLess: phrases.showLess
      },
      req,
      {
        body: body
      })
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
        const relatedStatisticsContent: Content<Statistics, DefaultPageConfig> | null = statisticsContentId ? get({
          key: statisticsContentId
        }) : null

        let preamble: string | undefined
        if (relatedStatisticsContent && hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], relatedStatisticsContent)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          preamble = relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription as string
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
