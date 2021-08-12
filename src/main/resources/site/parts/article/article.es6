const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req) {
  const page = getContent()
  const language = page.language ? (page.language === 'en' ? 'en-gb' : page.language) : 'nb'
  const phrases = getPhrases(page)

  const bodyText = processHtml({
    value: page.data.articleText ? page.data.articleText.replace(/&nbsp;/g, ' ') : undefined
  })

  const pubDate = moment(page.publish.from).locale(language).format('LL')
  const showModifiedDate = page.data.showModifiedDate
  let modifiedDate
  if (showModifiedDate) {
    modifiedDate = moment(showModifiedDate.dateOption.modifiedDate).locale(language).format('LL')
    if (showModifiedDate.dateOption.showModifiedTime) {
      modifiedDate = moment(page.data.showModifiedDate.dateOption.modifiedDate).locale(language).format('LLL')
    }
  }

  const authorConfig = page.data.authorItemSet ? forceArray(page.data.authorItemSet) : []
  const authors = authorConfig.length ? authorConfig.map((author) => {
    return {
      name: author.name,
      email: author.email
    }
  }) : undefined

  const associatedStatisticsConfig = page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []
  const associatedArticleArchivesConfig = page.data.articleArchive ? forceArray(page.data.articleArchive) : []

  const props = {
    phrases,
    introTitle: page.data.introTitle,
    title: page.displayName,
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    serialNumber: page.data.serialNumber,
    associatedStatistics: getAssociatedStatisticsLinks(associatedStatisticsConfig),
    associatedArticleArchives: getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig),
    isbn: isEnabled('article-isbn', true) && page.data.isbnNumber
  }

  return React4xp.render('site/parts/article/article', props, req)
}

function getAssociatedStatisticsLinks(associatedStatisticsConfig) {
  if (associatedStatisticsConfig.length) {
    return associatedStatisticsConfig.map((option) => {
      if (option._selected === 'XP') {
        const associatedStatisticsXP = option.XP.content
        const associatedStatisticsXPContent = associatedStatisticsXP ? get({
          key: associatedStatisticsXP
        }) : undefined

        if (associatedStatisticsXPContent) {
          return {
            text: associatedStatisticsXPContent.displayName,
            href: associatedStatisticsXP ? pageUrl({
              id: associatedStatisticsXP
            }) : ''
          }
        }
      } else if (option._selected === 'CMS') {
        const associatedStatisticsCMS = option.CMS

        return {
          text: associatedStatisticsCMS.title,
          href: associatedStatisticsCMS.href
        }
      }
    }).filter((statistics) => !!statistics)
  }
  return []
}

function getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig) {
  if (associatedArticleArchivesConfig.length) {
    return associatedArticleArchivesConfig.map((articleArchive) => {
      const articleArchiveContent = articleArchive ? get({
        key: articleArchive
      }) : undefined

      if (articleArchiveContent) {
        return {
          text: articleArchiveContent.displayName,
          href: articleArchive ? pageUrl({
            id: articleArchive
          }) : ''
        }
      }
    }).filter((articleArchive) => !!articleArchive)
  }
  return []
}
