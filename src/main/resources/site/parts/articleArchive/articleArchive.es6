const {
  getContent, imageUrl, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const contentLib = __non_webpack_require__('/lib/xp/content')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./articleArchive.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const language = page.language ? page.language === 'en' ? 'en-gb' : page.language : 'nb'
  const phrases = getPhrases(page)
  const title = page.displayName ? page.displayName : undefined

  const preambleText = page.data.preamble ? page.data.preamble : undefined
  const preambleObj = new React4xp('LeadParagraph')
    .setProps({
      children: preambleText
    })
    .setId('preamble')

  /* TODO: Image needs to rescale dynamically in mobile version */
  const image = page.data.image ? imageUrl({
    id: page.data.image,
    scale: 'block(1180, 275)'
  }) : undefined

  const imageAltText = page.data.image ? getImageAlt(page.data.image) : ' '
  const listOfArticles = parseArticleData(page._id, phrases, language)
  const listOfArticlesObj = new React4xp('ListOfArticles')
    .setProps({
      listOfArticlesSectionTitle: phrases.articleAnalysisPublications,
      articles: listOfArticles.map((article) => {
        return {
          ...article
        }
      }),
      showAll: phrases.showAll,
      showLess: phrases.showLess
    })
    .setId('listOfArticles')

  const freeText = page.data.freeText ? processHtml({
    value: page.data.freeText.replace(/&nbsp;/g, ' ')
  }) : undefined

  const issnNumber = page.data.issnNumber ? 'ISSN ' + page.data.issnNumber : undefined

  const model = {
    title,
    image,
    imageAltText,
    freeText,
    issnNumber
  }

  const preambleBody = preambleObj.renderBody({
    body: render(view, model)
  })
  const preamblePageContributions = preambleObj.renderPageContributions()

  const finalBody = listOfArticlesObj.renderBody({
    body: preambleBody
  })
  const finalPagePageContributions = listOfArticlesObj.renderPageContributions({
    pageContributions: preamblePageContributions
  })

  return {
    body: finalBody,
    pageContributions: finalPagePageContributions,
    contentType: 'text/html'
  }
}

const parseArticleData = (pageId, phrases, language) => {
  const articlesWithArticleArchivesSelected = contentLib.query({
    count: 9999,
    sort: 'publish.from DESC',
    query: `data.articleArchive = "${pageId}"`,
    contentTypes: [
      `${app.name}:article`
    ]
  })

  if (!articlesWithArticleArchivesSelected || !articlesWithArticleArchivesSelected.hits.length > 0) {
    return []
  }

  return articlesWithArticleArchivesSelected.hits.map((articleContent) => {
    return {
      year: getYear(articleContent.publish, articleContent.createdTime, language),
      subtitle: getSubTitle(articleContent, phrases, language),
      href: pageUrl({
        id: articleContent._id
      }),
      title: articleContent.displayName,
      preamble: articleContent.data.ingress
    }
  })
}

const getYear = (publish, createdTime, language) => {
  return publish && createdTime ? moment(publish.from).locale(language).format('YYYY') : moment(createdTime).locale(language).format('YYYY')
}

const getSubTitle = (articleContent, phrases, language) => {
  let type = ''
  if (articleContent.type === `${app.name}:article`) {
    type = phrases.articleName
  }

  let prettyDate = ''
  if (articleContent.publish && articleContent.publish.from) {
    prettyDate = moment(articleContent.publish.from).locale(language).format('LL')
  } else {
    prettyDate = moment(articleContent.createdTime).locale(language).format('LL')
  }

  return `${type ? `${type} / ` : ''}${prettyDate}`
}


