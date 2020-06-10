const {
  data
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

const NO_RELATED_STATISTICS_FOUND_EDIT_MODE = {
  body: render(view)
}
const NO_RELATED_STATISTICS_FOUND = {
  body: ''
}

const renderPart = (req) => {
  const page = getContent()
  const relatedStatistics = page.data.relatedStatistics

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  if (!relatedStatistics || relatedStatistics.length === 0) {
    if (req.mode === 'edit') {
      return NO_RELATED_STATISTICS_FOUND_EDIT_MODE
    }
  }

  return renderRelatedStatistics(getRelatedContent(relatedStatistics ? data.forceArray(relatedStatistics) : []), phrases)
}

const renderRelatedStatistics = (relatedStatisticsContent, phrases) => {
  if (relatedStatisticsContent && relatedStatisticsContent.length) {
    const relatedStatisticsXP = new React4xp('RelatedStatistics')
      .setProps({
        relatedStatistics: relatedStatisticsContent.map(({
          title, preamble, href
        }) => {
          return {
            title,
            preamble,
            href
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
        body
      }),
      pageContributions: relatedStatisticsXP.renderPageContributions()
    }
  }
  return NO_RELATED_STATISTICS_FOUND
}

const getRelatedContent = (relatedStatistics) => {
  return relatedStatistics.map((relatedContent) => {
    const relatedStatisticsContent = get({
      key: relatedContent
    })

    let preamble
    if (relatedStatisticsContent.x &&
        relatedStatisticsContent.x['com-enonic-app-metafields'] &&
        relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'] &&
        relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription) {
      preamble = relatedStatisticsContent.x['com-enonic-app-metafields']['meta-data'].seoDescription
    }

    return {
      title: relatedStatisticsContent.displayName,
      preamble,
      href: pageUrl({
        id: relatedContent
      })
    }
  })
}
