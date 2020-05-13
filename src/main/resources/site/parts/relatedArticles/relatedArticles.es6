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
  getImageCaption
} = __non_webpack_require__('/lib/ssb/utils')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const moment = require('moment/min/moment-with-locales')

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
  if (!relatedArticles || relatedArticles.length === 0) {
    if (req.mode === 'edit' || req.mode === 'preview') {
      return {
        body: render(view)
      }
    }
    return {
      body: null
    }
  }

  const page = getContent()
  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  relatedArticles = relatedArticles.map((article) => {
    if (article._selected === 'article') {
      const articleContent = get({
        key: article.article.article
      })

      if (!articleContent) {
        return null
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
        imageAlt = getImageCaption(image)
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
    } else if (article._selected === 'externalArticle') {
      const imageSrc = imageUrl({
        id: article.externalArticle.image,
        scale: 'block(320, 180)' // 16:9
      })
      const imageAlt = getImageCaption(article.externalArticle.image)

      return {
        title: article.externalArticle.title,
        subTitle: article.externalArticle.subTitle || '',
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
      showLess: phrases.showLess
    })
    .setId('related-articles')
    .uniqueId()

  const body = render(view, {
    relatedArticlesId: relatedArticlesComponent.react4xpId
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
