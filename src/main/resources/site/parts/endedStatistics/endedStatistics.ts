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
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./endedStatistics.html')

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
  const endedStatistics = part.config.relatedStatisticsOptions

  const phrases = getPhrases(page)

  return renderEndedStatistics(parseContent(endedStatistics ? forceArray(endedStatistics) : []), phrases)
}

const renderEndedStatistics = (endedStatisticsContent, phrases) => {
  if (endedStatisticsContent && endedStatisticsContent.length) {
    const endedStatisticsXP = new React4xp('EndedStatistics')
      .setProps({
        endedStatistics: endedStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        }),
        iconText: phrases.endedCardText,
        buttonText: phrases.endedStatistics
      })
      .uniqueId()

    const body = render(view, {
      endedStatisticsId: endedStatisticsXP.react4xpId
    })

    return {
      body: endedStatisticsXP.renderBody({
        body
      }),
      pageContributions: endedStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: null,
    pageContributions: null
  }
}

const parseContent = (endedStatistics) => {
  if (endedStatistics.length > 0) {
    return endedStatistics.map((statistics) => {
      if (statistics._selected === 'xp') {
        const statisticsContentId = statistics.xp.contentId
        const endedStatisticsContent = get({
          key: statisticsContentId
        })

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], endedStatisticsContent)) {
          preamble = endedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: endedStatisticsContent.displayName,
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
