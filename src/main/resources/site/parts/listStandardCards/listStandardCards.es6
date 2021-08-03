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
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
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
const view = resolve('listStandardCards.html')

exports.get = (req) => {
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = () => renderPart()

function renderPart() {
  const page = getContent()
  const part = getComponent()
  const standardCardsConfig = part.config.statisticsItemSet ? forceArray(part.config.statisticsItemSet) : []
  const phrases = getPhrases(page)
  const statisticsTitle = part.config.title ? part.config.title : phrases.menuStatistics

  return renderStandardCardsList(statisticsTitle, parseContent(standardCardsConfig))
}

function renderStandardCardsList(statisticsTitle, standardCardsContent) {
  if (standardCardsContent && standardCardsContent.length) {
    const activeStatisticsXP = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: standardCardsContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        })
      })
      .uniqueId()

    const body = render(view, {
      activeStatisticsId: activeStatisticsXP.react4xpId,
      statisticsTitle
    })

    return {
      body: activeStatisticsXP.renderBody({
        body
      }),
      pageContributions: activeStatisticsXP.renderPageContributions()
    }
  }
  return {
    body: undefined,
    pageContributions: undefined
  }
}

function parseContent(standardCardsContent) {
  if (standardCardsContent.length) {
    return standardCardsContent.map((standardCard) => {
      const iconId = standardCard.icon
      const iconData = iconId ? get({
        key: iconId
      }) : null
      const iconPath = iconId ? imageUrl({
        id: iconId,
        scale: 'block(100, 100)'
      }) : undefined

      if (standardCard.contentXP) {
        const statisticsContentId = standardCard.contentXP
        const contentXPContent = get({
          key: statisticsContentId
        })

        let preamble = ''
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], contentXPContent) && contentXPContent) {
          preamble = contentXPContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          icon: iconPath,
          iconAlt: iconId ? iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId) : '',
          title: contentXPContent.displayName,
          preamble: preamble,
          href: pageUrl({
            id: statisticsContentId
          })
        }
      }

      return {
        icon: iconPath,
        iconAlt: iconId ? iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId) : '',
        title: standardCard.title,
        preamble: standardCard.profiledText,
        href: standardCard.href
      }
    }).filter((content) => !!content)
  }
  return []
}
