const {
  data
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const languageLib = __non_webpack_require__( '/lib/language')
const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./article.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req) {
  const page = getContent()
  moment.locale(page.language ? page.language : 'nb')

  const bodyText = processHtml({
    value: page.data.articleText ? page.data.articleText.replace(/&nbsp;/g, ' ') : undefined
  })

  const pubDate = moment(page.publish.from).format('DD. MMMM YYYY')
  const showModifiedDate = page.data.showModifiedDate
  let modifiedDate
  if (showModifiedDate) {
    modifiedDate = moment(showModifiedDate.dateOption.modifiedDate).format('DD. MMMM YYYY')
    if (showModifiedDate.dateOption.showModifiedTime) {
      modifiedDate = moment(page.data.showModifiedDate.dateOption.modifiedDate).format('DD. MMMM YYYY hh:mm')
    }
  }

  const authorConfig = page.data.authorItemSet ? data.forceArray(page.data.authorItemSet) : []
  const authors = authorConfig.map((author) => {
    return {
      name: author.name,
      email: author.email
    }
  })

  const divider = new React4xp('Divider')
    .setProps({
      dark: true
    })
    .setId('dividerId')

  const associatedStatisticsConfig = page.data.associatedStatistics ? data.forceArray(page.data.associatedStatistics) : []
  const associatedStatistics = getAssociatedStatisticsLinks(associatedStatisticsConfig)

  const model = {
    title: page.displayName,
    language: languageLib.getLanguage(page),
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    associatedStatistics,
    serialNumber: page.data.serialNumber,
    introTitle: page.data.introTitle
  }

  const body = render(view, model)
  const dividerBody = divider.renderBody({
    body
  })

  return {
    body: associatedStatistics.length ? dividerBody : body,
    contentType: 'text/html'
  }
}

const getAssociatedStatisticsLinks = (associatedStatisticsConfig) => {
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
