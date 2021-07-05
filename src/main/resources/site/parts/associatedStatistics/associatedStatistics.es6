const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, pageUrl
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

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./associatedStatistics.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const phrases = getPhrases(page)

  const associatedStatisticsHeader = phrases.associatedStatisticsHeader
  const associatedStatisticsConfig = page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []
  const associatedStatisticsLinks = getAssociatedStatisticsLinks(associatedStatisticsConfig)

  if (!associatedStatisticsConfig.length) {
    if (req.mode === 'edit' && !(page.type === `${app.name}:article`)) {
      return {
        body: render(view, {
          associatedStatisticsHeader
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const associatedStatisticsLinksComponent = new React4xp('Links')
    .setProps({
      links: associatedStatisticsLinks.map((statistics) => {
        return {
          ...statistics
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    associatedStatisticsHeader,
    associatedStatisticsLinksId: associatedStatisticsLinksComponent.react4xpId
  })

  return {
    body: associatedStatisticsLinksComponent.renderBody({
      body
    }),
    pageContributions: associatedStatisticsLinksComponent.renderPageContributions()
  }
}

const getAssociatedStatisticsLinks = (associatedStatisticsConfig) => {
  if (associatedStatisticsConfig.length > 0) {
    return associatedStatisticsConfig.map((option) => {
      if (option._selected === 'XP') {
        const associatedStatisticsXP = option.XP.content
        const associatedStatisticsXPContent = get({
          key: associatedStatisticsXP
        })

        if (associatedStatisticsXPContent) {
          return {
            children: associatedStatisticsXPContent.displayName,
            href: pageUrl({
              id: associatedStatisticsXP
            })
          }
        }
      } else if (option._selected === 'CMS') {
        const associatedStatisticsCMS = option.CMS

        return {
          children: associatedStatisticsCMS.title,
          href: associatedStatisticsCMS.href
        }
      }
    }).filter((statistics) => !!statistics)
  }
  return []
}
