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
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const languageLib = __non_webpack_require__('/lib/ssb/utils/language')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
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
  const language = page.language ? page.language === 'en' ? 'en-gb' : page.language : 'nb'

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
  const authors = authorConfig.map((author) => {
    return {
      name: author.name,
      email: author.email
    }
  })

  const phrases = languageLib.getPhrases(page)

  const associatedStatisticsHeader = phrases.associatedStatisticsHeader
  const associatedStatisticsConfig = page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []
  const associatedStatisticsLinks = getAssociatedStatisticsLinks(associatedStatisticsConfig)

  const associatedStatisticsLinksComponent = new React4xp('Links')
    .setProps({
      links: associatedStatisticsLinks.map((statistics) => {
        return {
          ...statistics
        }
      })
    })
    .uniqueId()

  const associatedArticleArchivesHeader = phrases.associatedArticleArchivesHeader
  const associatedArticleArchivesConfig = page.data.articleArchive ? forceArray(page.data.articleArchive) : []
  const associatedArticleArchiveLinks = getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig)

  const associatedArticleArchiveLinksComponent = new React4xp('Links')
    .setProps({
      links: associatedArticleArchiveLinks.map((articleArchiveLinks) => {
        return {
          ...articleArchiveLinks
        }
      })
    })
    .uniqueId()

  const model = {
    title: page.displayName,
    language: languageLib.getLanguage(page),
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    serialNumber: page.data.serialNumber,
    introTitle: page.data.introTitle,
    isbn: isEnabled('article-isbn', true) && page.data.isbnNumber,
    associatedStatisticsHeader,
    associatedStatisticsLinksId: associatedStatisticsLinksComponent.react4xpId,
    associatedArticleArchivesHeader,
    associatedArticleArchiveLinksId: associatedArticleArchiveLinksComponent.react4xpId
  }

  const thymeLeadBody = render(view, model)
  if (associatedStatisticsLinksComponent.length) {
    return {
      body: associatedArticleArchiveLinksComponent.renderBody({
        body: thymeLeadBody
      }),
      pageContributions: associatedArticleArchiveLinksComponent.renderPageContributions()
    }
  }

  if (associatedArticleArchivesConfig.length) {
    return {
      body: associatedStatisticsLinksComponent.renderBody({
        body: thymeLeadBody
      }),
      pageContributions: associatedStatisticsLinksComponent.renderPageContributions()
    }
  }

  return {

  }
}

const getAssociatedStatisticsLinks = (associatedStatisticsConfig) => {
  if (associatedStatisticsConfig.length) {
    return associatedStatisticsConfig.map((option) => {
      if (option._selected === 'XP') {
        const associatedStatisticsXP = option.XP.content
        const associatedStatisticsXPContent = associatedStatisticsXP ? get({
          key: associatedStatisticsXP
        }) : undefined

        if (associatedStatisticsXPContent) {
          return {
            children: associatedStatisticsXPContent.displayName,
            href: associatedStatisticsXP ? pageUrl({
              id: associatedStatisticsXP
            }) : ''
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

const getAssociatedArticleArchiveLinks = (associatedArticleArchivesConfig) => {
  if (associatedArticleArchivesConfig.length) {
    return associatedArticleArchivesConfig.map((articleArchive) => {
      const articleArchiveContent = articleArchive ? get({
        key: articleArchive
      }) : undefined

      if (articleArchiveContent) {
        return {
          children: articleArchiveContent.displayName,
          href: articleArchive ? pageUrl({
            id: articleArchive
          }) : ''
        }
      }
    }).filter((articleArchive) => !!articleArchive)
  }
  return []
}
