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
const view = resolve('./relatedStatistics.html')

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
  const relatedStatistics = page.data.relatedStatisticsOptions

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const statisticsTitle = phrases.menuStatistics
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

const renderRelatedStatistics = (statisticsTitle, relatedStatisticsContent, phrases) => {
  if (relatedStatisticsContent && relatedStatisticsContent.length) {
    const relatedStatisticsXP = new React4xp('RelatedStatistics')
      .setProps({
        headerTitle: statisticsTitle,
        relatedStatistics: relatedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        showAll: phrases.showAll,
        showLess: phrases.showLess
      })
      .uniqueId()

    const body = render(view, {
      relatedStatisticsId: relatedStatisticsXP.react4xpId
    })

    return {
      body: relatedStatisticsXP.renderBody({
        body,
        label: statisticsTitle
      }),
      pageContributions: relatedStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: null,
    pageContributions: null
  }
}

const parseRelatedContent = (relatedStatistics) => {
  if (relatedStatistics.length > 0) {
    return relatedStatistics.map((statistics) => {
      if (statistics._selected === 'xp') {
        const statisticsContentId = statistics.xp.contentId
        const relatedStatisticsContent = get({
          key: statisticsContentId
        })

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], relatedStatisticsContent)) {
          preamble = relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: relatedStatisticsContent.displayName,
          preamble,
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
