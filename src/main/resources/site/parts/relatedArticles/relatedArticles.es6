const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const React4xp = require('/lib/enonic/react4xp')
const {
  getContent,
  pageUrl,
  imageUrl,
  imagePlaceholder
} = __non_webpack_require__( '/lib/xp/portal')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__('/lib/util')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  fromRelatedArticlesCache
} = __non_webpack_require__('/lib/ssb/cache')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  hasRole
} = __non_webpack_require__('/lib/xp/auth')
const moment = require('moment/min/moment-with-locales')
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
  const phrases = getPhrases(page)
  const showPreview = req.params.showDraft && hasRole('system.admin') && req.mode === 'preview'

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

  moment.locale(page.language ? page.language : 'nb')

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
        let imageAlt = ''

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
          imageAlt = getImageAlt(image)
        }


        return {
          title: articleContent.displayName,
          subTitle: getSubTitle(articleContent, phrases),
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
        const prettyDate = moment(article.externalArticle.date).format('DD. MMMM YYYY')
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


const getSubTitle = (articleContent, phrases) => {
  let type = ''
  if (articleContent.type === `${app.name}:article`) {
    type = phrases.articleName
  }
  let prettyDate = ''
  if (articleContent.publish && articleContent.publish.from) {
    prettyDate = moment(articleContent.publish.from).format('DD. MMMM YYYY')
  } else {
    prettyDate = moment(articleContent.createdTime).format('DD. MMMM YYYY')
  }
  return `${type ? `${type} / ` : ''}${prettyDate}`
}

const addDsArticle = (page, relatedArticles, showPreview) => {
  const statisticId = page._id
  const statistic = getStatisticByIdFromRepo(page.data.statistic)

  if (statistic) {
    const variants = util.data.forceArray(statistic.variants)
    const previousRelease = getPreviousRelease(variants)
    const nextRelease = getNextRelease(variants)
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

const getPreviousRelease = (variants) => {
  if (variants.length > 1) {
    variants.sort((d1, d2) => new Date(d1.previousRelease) - new Date(d2.previousRelease)).reverse()
  }
  return variants[0].previousRelease
}

const getNextRelease = (variants) => {
  const variantWithDate = variants.filter((variant) => variant.nextRelease !== '' && moment(variant.nextRelease).isAfter(new Date(), 'day'))
  if (variantWithDate.length > 1) {
    variantWithDate.sort((d1, d2) => new Date(d1.nextRelease) - new Date(d2.nextRelease))
  }
  return variantWithDate.length > 0 ? variantWithDate[0].nextRelease : ''
}
