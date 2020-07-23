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

const moment = require('moment/min/moment-with-locales')
const languageLib = __non_webpack_require__( '/lib/language')

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

  const appurtenantStatistics = []

  const appurtenantStatisticsXP = page.data.appurtenantStatisticsXP ? data.forceArray(page.data.appurtenantStatisticsXP) : []
  appurtenantStatisticsXP.map((appurtenantStatisticsXPContent) => {
    if (appurtenantStatisticsXPContent) {
      const appurtenantStatisticsXPInfo = get({
        key: appurtenantStatisticsXPContent
      })

      appurtenantStatistics.push({
        name: appurtenantStatisticsXPInfo.displayName,
        href: pageUrl({
          id: appurtenantStatisticsXPContent
        })
      })
    }
  })

  const appurtenantStatisticsCMS = page.data.appurtenantStatisticsCMS ? data.forceArray(page.data.appurtenantStatisticsCMS) : []
  appurtenantStatisticsCMS.map((appurtenantStatisticsCMSItems) => {
    if (appurtenantStatisticsCMSItems) {
      appurtenantStatistics.push({
        ...appurtenantStatisticsCMSItems
      })
    }
  })

  appurtenantStatistics.sort((a, b) => a.name.localeCompare(b.name))

  const model = {
    title: page.displayName,
    language: languageLib.getLanguage(page),
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    appurtenantStatistics,
    serialNumber: page.data.serialNumber,
    introTitle: page.data.introTitle
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
