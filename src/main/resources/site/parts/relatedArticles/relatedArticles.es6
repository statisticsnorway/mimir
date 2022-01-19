import { formatDate } from '../../../lib/ssb/utils/dateUtils'

const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent,
  pageUrl,
  imageUrl,
  imagePlaceholder
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  fromRelatedArticlesCache
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  hasWritePermissionsAndPreview
} = __non_webpack_require__('/lib/ssb/parts/permissions')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const contentLib = __non_webpack_require__('/lib/xp/content')

const view = resolve('./relatedArticles.html')

exports.get = function(req) {
  try {
    let relatedArticles = getContent().data.relatedArticles
    if (relatedArticles) {
      relatedArticles = util.data.forceArray(relatedArticles)
    } else {
      relatedArticles = []
    }
    return renderPart(req, relatedArticles)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, relatedArticles) {
  const page = getContent()
  const language = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const phrases = getPhrases(page)
  const showPreview = req.params.showDraft && hasWritePermissionsAndPreview(req, page._id)
  if (page.type === `${app.name}:statistics`) {
    addDsArticle(page, relatedArticles, showPreview)
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:article` && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          heading: phrases.relatedArticlesHeading
        })
      }
    }
    return {
      body: null
    }
  }

  relatedArticles = relatedArticles.map((article) => {
    if (article._selected === 'article') {
      return fromRelatedArticlesCache(req, article.article.article, () => {
        const articleContent = get({
          key: article.article.article
        })

        if (!articleContent) {
          return undefined
        }

        let imageSrc
        let imageAlt = ' '

        if (!articleContent.x ||
            !articleContent.x['com-enonic-app-metafields'] ||
            !articleContent.x['com-enonic-app-metafields']['meta-data'] ||
            !articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage) {
          imageSrc = imagePlaceholder({
            width: 320,
            height: 180
          })
        } else { // use placeholder if there is no seo image on the article
          const image = articleContent.x['com-enonic-app-metafields']['meta-data'].seoImage
          imageSrc = imageUrl({
            id: image,
            scale: 'block(320, 180)' // 16:9
          })
          imageAlt = getImageAlt(image) ? getImageAlt(image) : ' '
        }


        return {
          title: articleContent.displayName,
          subTitle: getSubTitle(articleContent, phrases, language),
          preface: articleContent.data.ingress,
          href: pageUrl({
            id: articleContent._id
          }),
          imageSrc,
          imageAlt
        }
      })
    } else if (article._selected === 'externalArticle') {
      const imageSrc = imageUrl({
        id: article.externalArticle.image,
        scale: 'block(320, 180)' // 16:9
      })
      const imageAlt = getImageAlt(article.externalArticle.image)
      let subTitle = ''
      if (article.externalArticle.type) {
        subTitle = article.externalArticle.type
      }
      if (article.externalArticle.date) {
        const prettyDate = formatDate(article.externalArticle.date, 'PPP', language)
        subTitle += `${subTitle ? ' / ' : ''}${prettyDate}`
      }

      return {
        title: article.externalArticle.title,
        subTitle,
        preface: article.externalArticle.preface,
        href: article.externalArticle.url,
        imageSrc,
        imageAlt
      }
    }
    return null
  }).filter((article) => !!article)

  const relatedArticlesComponent = new React4xp('RelatedArticles')
    .setProps({
      relatedArticles,
      showAll: phrases.showAll,
      showLess: phrases.showLess,
      heading: phrases.relatedArticlesHeading
    })
    .setId('related-articles')
    .uniqueId()

  const body = render(view, {
    relatedArticlesId: relatedArticlesComponent.react4xpId,
    heading: phrases.relatedArticlesHeading
  })
  return {
    body: relatedArticlesComponent.renderBody({
      body
    }),
    pageContributions: relatedArticlesComponent.renderPageContributions()
  }
}


const getSubTitle = (articleContent, phrases, language) => {
  let type = ''
  if (articleContent.type === `${app.name}:article`) {
    type = phrases.articleName
  }
  let prettyDate = ''
  if (articleContent.publish && articleContent.publish.from) {
    prettyDate = formatDate(articleContent.publish.from, 'PPP', language)
  } else {
    prettyDate = formatDate(articleContent.createdTime, 'PPP', language)
  }
  return `${type ? `${type} / ` : ''}${prettyDate}`
}

const addDsArticle = (page, relatedArticles, showPreview) => {
  const statisticId = page._id
  const statistic = getStatisticByIdFromRepo(page.data.statistic)

  if (statistic) {
    const variants = util.data.forceArray(statistic.variants)
    const releaseDates = getReleaseDatesByVariants(variants)
    const nextRelease = releaseDates.nextRelease[0]
    const previousRelease = releaseDates.previousRelease[0]
    const statisticPublishDate = showPreview && nextRelease !== '' ? nextRelease : previousRelease
    const assosiatedArticle = getDsArticle(statisticId, statisticPublishDate)

    if (assosiatedArticle) {
      relatedArticles.unshift(assosiatedArticle)
    }
  }

  return relatedArticles
}

const getDsArticle = (statisticId, statisticPublishDate) => {
  statisticPublishDate = moment(new Date(statisticPublishDate)).format('YYYY-MM-DD')
  const articleContent = contentLib.query({
    count: 1,
    sort: 'publish.from DESC',
    query: `data.associatedStatistics.XP.content = "${statisticId}" AND publish.from LIKE "${statisticPublishDate}*" `,
    contentTypes: [
      `${app.name}:article`
    ]
  }).hits

  const articleObject = articleContent.length > 0 ? {
    _selected: 'article',
    article: {
      article: articleContent[0]._id
    }
  } : undefined

  return articleObject
}
