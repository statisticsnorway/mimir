const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent, pageUrl
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
  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  const associatedStatisticsHeader = phrases.associatedStatisticsHeader
  const associatedStatisticsConfig = page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []
  const associatedStatisticsLinks = getAssociatedStatisticsLinks(associatedStatisticsConfig)

  if (!associatedStatisticsConfig.length > 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article`) {
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
      links: associatedStatisticsLinks.map(({
        title, href
      }) => {
        return {
          children: title,
          href
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    associatedStatisticsHeader,
    associatedStatisticsLinksId: associatedStatisticsLinksComponent.react4xpId
  })

  const isOutsideContentStudio = (
    req.mode === 'live' || req.mode === 'preview'
  )

  return {
    body: associatedStatisticsLinksComponent.renderBody({
      body,
      clientRender: isOutsideContentStudio
    }),
    pageContributions: associatedStatisticsLinksComponent.renderPageContributions({
      clientRender: isOutsideContentStudio
    }),
    contentType: 'text/html'
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

        return {
          title: associatedStatisticsXPContent.displayName,
          href: pageUrl({
            id: associatedStatisticsXP
          })
        }
      } else if (option._selected === 'CMS') {
        const associatedStatisticsCMS = option.CMS

        return {
          ...associatedStatisticsCMS
        }
      }
    })
  }
  return []
}
