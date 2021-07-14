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
  imageUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getImageCaption,
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/utils')
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
  const oldActiveStatistics = part.config.relatedStatisticsOptions ? forceArray(part.config.relatedStatisticsOptions) : []
  const activeStatistics = part.config.statisticsItemSet ? forceArray(part.config.statisticsItemSet) : []
  const phrases = getPhrases(page)

  const statisticsTitle = part.config.title ? part.config.title : phrases.menuStatistics
  if (!oldActiveStatistics || oldActiveStatistics.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          statisticsTitle
        })
      }
    }
  }

  return renderActiveStatistics(statisticsTitle, parseContent(oldActiveStatistics, activeStatistics, phrases))
}

const renderActiveStatistics = (statisticsTitle, activeStatisticsContent) => {
  if (activeStatisticsContent && activeStatisticsContent.length) {
    const activeStatisticsXP = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: activeStatisticsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        })
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

const parseContent = (oldActiveStatistics, activeStatisticsContent) => {
  if (activeStatisticsContent.length) {
    return activeStatisticsContent.map((activeStatistics) => {
      if (activeStatistics.contentXP) {
        const statisticsContentId = activeStatistics.contentXP
        const activeStatisticsContent = get({
          key: statisticsContentId
        })

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], activeStatisticsContent)) {
          preamble = activeStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        const iconId = activeStatistics.icon
        const iconData = get({
          key: iconId
        })

        return {
          icon: imageUrl({
            id: iconId,
            scale: 'block(100, 100)'
          }),
          iconAlt: iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId),
          title: activeStatisticsContent.displayName,
          preamble: preamble ? preamble : '',
          href: pageUrl({
            id: statisticsContentId
          })
        }
      }

      const iconId = activeStatistics.icon
      const iconData = get({
        key: iconId
      })

      return {
        icon: imageUrl({
          id: iconId,
          scale: 'block(100, 100)'
        }),
        iconAlt: iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId),
        title: activeStatistics.title,
        preamble: activeStatistics.profiledText,
        href: activeStatistics.url
      }
    }).filter((statistics) => !!statistics)
  }

  if (oldActiveStatistics.length) {
    return oldActiveStatistics.map((statistics) => {
      if (statistics._selected === 'xp') {
        const statisticsContentId = statistics.xp.contentId
        const oldActiveStatisticsContent = get({
          key: statisticsContentId
        })

        let preamble
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], oldActiveStatisticsContent)) {
          preamble = oldActiveStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          title: oldActiveStatisticsContent.displayName,
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
