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
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./associatedArticleArchives.html')

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

  const associatedArticleArchivesHeader = phrases.associatedArticleArchivesHeader
  const associatedArticleArchivesConfig = page.data.articleArchive ? forceArray(page.data.articleArchive) : []
  const associatedArticleArchiveLinks = getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig)

  if (!associatedArticleArchivesConfig.length > 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          associatedArticleArchivesHeader
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const associatedArticleArchiveLinksComponent = new React4xp('Links')
    .setProps({
      links: associatedArticleArchiveLinks.map((articleArchiveLinks) => {
        return {
          ...articleArchiveLinks
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    associatedArticleArchivesHeader,
    associatedArticleArchiveLinksId: associatedArticleArchiveLinksComponent.react4xpId
  })

  return {
    body: associatedArticleArchiveLinksComponent.renderBody({
      body
    }),
    pageContributions: associatedArticleArchiveLinksComponent.renderPageContributions(),
    contentType: 'text/html'
  }
}

const getAssociatedArticleArchiveLinks = (associatedArticleArchivesConfig) => {
  if (associatedArticleArchivesConfig.length > 0) {
    return associatedArticleArchivesConfig.map((articleArchive) => {
      const articleArchiveContent = get({
        key: articleArchive
      })

      if (articleArchiveContent) {
        return {
          children: articleArchiveContent.displayName,
          href: pageUrl({
            id: articleArchive
          })
        }
      }
      return null
    }).filter((articleArchive) => !!articleArchive)
  }
  return []
}
