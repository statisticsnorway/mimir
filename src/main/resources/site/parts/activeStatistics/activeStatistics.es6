import { hasPath } from 'ramda'
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent,
  getComponent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./activeStatistics.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const part = getComponent()
  const activeStatistics = part.config.relatedStatisticsOptions

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const statisticsTitle = phrases.menuStatistics
  if (!activeStatistics || activeStatistics.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics` && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          statisticsTitle
        })
      }
    }
  }

  return renderActiveStatistics(statisticsTitle, parseContent(activeStatistics ? forceArray(activeStatistics) : []), phrases)
}

const renderActiveStatistics = (statisticsTitle, activeStatisticsContent, phrases) => {
  if (activeStatisticsContent && activeStatisticsContent.length) {
    const activeStatisticsXP = new React4xp('RelatedStatistics')
      .setProps({
        headerTitle: statisticsTitle,
        relatedStatistics: activeStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        showAll: phrases.showAll,
        showLess: phrases.showLess
      })
      .uniqueId()

    const body = render(view, {
      activeStatisticsId: activeStatisticsXP.react4xpId
    })

    return {
      body: activeStatisticsXP.renderBody({
        body,
        label: statisticsTitle
      }),
      pageContributions: activeStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: null,
    pageContributions: null
  }
}

const parseContent = (activeStatistics) => {
  if (activeStatistics.length > 0) {
    return activeStatistics.map((statistics) => {
      if (statistics._selected === 'xp') {
        const statisticsContentId = statistics.xp.contentId
        const activeStatisticsContent = get({
          key: statisticsContentId
        })

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], activeStatisticsContent)) {
          preamble = activeStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: activeStatisticsContent.displayName,
          preamble: preamble ? preamble : '',
          href: pageUrl({
            id: statisticsContentId
          })
        }
      }

      return {
        title: statistics.cms.title,
        preamble: statistics.cms.profiledText,
        href: statistics.cms.url
      }
    }).filter((statistics) => !!statistics)
  }
  return []
}
