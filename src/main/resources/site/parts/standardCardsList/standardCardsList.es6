const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  imageUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
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
const view = resolve('standardCardsList.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()
  const standardCardsListConfig = part.config.statisticsItemSet ? forceArray(part.config.statisticsItemSet) : []

  const statisticsTitle = part.config.title

  if (!standardCardsListConfig.length && req.mode === 'edit') {
    return {
      body: render(view, {
        // Title is optional. The text is just a placeholder so that the user is aware that the part is present in cases where the config is empty.
        label: statisticsTitle ? statisticsTitle : 'Liste standard kort'
      })
    }
  }

  return renderStandardCardsList(statisticsTitle, parseContent(standardCardsListConfig))
}

function renderStandardCardsList(statisticsTitle, standardCardsListContent) {
  if (standardCardsListContent && standardCardsListContent.length) {
    const standardCardsComponent = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: standardCardsListContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        })
      })
      .uniqueId()

    const body = render(view, {
      standardCardsListComponentId: standardCardsComponent.react4xpId,
      statisticsTitle
    })

    return {
      body: standardCardsComponent.renderBody({
        body
      }),
      pageContributions: standardCardsComponent.renderPageContributions()
    }
  }
  return {
    body: undefined,
    pageContributions: undefined
  }
}

function parseContent(standardCardsListContent) {
  if (standardCardsListContent.length) {
    return standardCardsListContent.map((standardCard) => {
      const iconId = standardCard.icon
      const iconData = iconId ? get({
        key: iconId
      }) : null
      const iconPath = iconId ? imageUrl({
        id: iconId,
        scale: 'block(100, 100)'
      }) : undefined

      if (standardCard.contentXP) {
        const standardCardContentId = standardCard.contentXP
        const pageContent = get({
          key: standardCardContentId
        })

        let preamble = ''
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], pageContent) && pageContent) {
          preamble = pageContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
        }

        return {
          icon: iconPath,
          iconAlt: iconId ? iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId) : '',
          title: pageContent.displayName,
          preamble: preamble,
          href: pageUrl({
            id: standardCardContentId
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
