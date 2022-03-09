import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { ResourceKey, ThymeleafLibrary } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { ActiveStatisticsPartConfig } from './activeStatistics-part-config'
import { Statistics } from '../../content-types/statistics/statistics'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./activeStatistics.html')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content = getContent()
  const part: ActiveStatisticsPartConfig = getComponent().config
  const activeStatistics: Array<CmsStatistic|XpStatistic> = part.relatedStatisticsOptions ? forceArray(part.relatedStatisticsOptions) : []

  const statisticsTitle: string = localize({
    key: 'menuStatistics',
    locale: page.language
  })


  if (!activeStatistics || activeStatistics.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          statisticsTitle
        }),
        pageContributions: ''
      }
    }
  }

  return renderActiveStatistics(statisticsTitle, parseContent(activeStatistics))
}

function renderActiveStatistics(statisticsTitle: string, activeStatisticsContent: Array<ActiveStatistic | undefined>): React4xpResponse {
  if (activeStatisticsContent && activeStatisticsContent.length) {
    const activeStatisticsXP: React4xpObject = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: activeStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        })
      })
      .uniqueId()

    const body: string = render(view, {
      activeStatisticsId: activeStatisticsXP.react4xpId
    })

    return {
      body: activeStatisticsXP.renderBody({
        body
      }),
      pageContributions: activeStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: '',
    pageContributions: ''
  }
}

function parseContent(activeStatistics: Array<CmsStatistic|XpStatistic>): Array<ActiveStatistic | undefined> {
  if ( activeStatistics && activeStatistics.length) {
    return activeStatistics.map((statistics:CmsStatistic | XpStatistic) => {
      if (statistics._selected === 'xp' && statistics.xp.contentId) {
        const statisticsContentId: string = statistics.xp.contentId
        const activeStatisticsContent: Content<Statistics> | null = get({
          key: statisticsContentId
        })

        let preamble: string = ''
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], activeStatisticsContent)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          preamble = activeStatisticsContent?.x['com-enonic-app-metafields']['meta-data'].seoDescription as string
        }

        return {
          title: activeStatisticsContent ? activeStatisticsContent.displayName : '',
          preamble: preamble ? preamble : '',
          href: pageUrl({
            id: statisticsContentId
          })
        }
      } else if (statistics._selected === 'cms') {
        return {
          title: statistics.cms.title,
          preamble: statistics.cms.profiledText,
          href: statistics.cms.url
        }
      } else return undefined
    }).filter((statistics) => !!statistics)
  } else return []
}

interface ActiveStatistic {
  title: string;
  preamble: string;
  href: string;
}

interface SingleStatistic {
  _selected: string;
}

interface CmsStatistic extends SingleStatistic {
  _selected: 'cms';
  cms: {
    title: string;
    profiledText: string;
    url: string;
  }
}

interface XpStatistic extends SingleStatistic {
  _selected: 'xp';
  xp: {
    contentId?: string;
  };
}
