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

  const appurtenantStatisticsConfig = page.data.appurtenantStatistics ? data.forceArray(page.data.appurtenantStatistics) : []
  const appurtenantStatistics = getAppurtenantStatisticsLinks(appurtenantStatisticsConfig)

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

  return {
    body: divider.renderBody({
      body: render(view, model)
    }),
    contentType: 'text/html'
  }
}

const getAppurtenantStatisticsLinks = (appurtenantStatisticsConfig) => {
  return appurtenantStatisticsConfig.map((option) => {
    if (option._selected === 'appurtenantStatisticsXP') {
      const appurtenantStatisticsXP = option.appurtenantStatisticsXP.appurtenantStatisticsXPContent
      const appurtenantStatisticsXPContent = get({
        key: appurtenantStatisticsXP
      })

      return {
        title: appurtenantStatisticsXPContent.displayName,
        href: pageUrl({
          id: appurtenantStatisticsXP
        })
      }
    } else if (option._selected === 'appurtenantStatisticsCMS') {
      const appurtenantStatisticsCMS = option.appurtenantStatisticsCMS

      return {
        ...appurtenantStatisticsCMS
      }
    }
  })
}
