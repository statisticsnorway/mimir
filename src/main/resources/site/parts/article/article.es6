const {
  data
} = __non_webpack_require__('/lib/util')
const {
  getContent, processHtml
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

  const authorConfig = page.data.authorItemSet ? data.forceArray(page.data.authorItemSet) : []
  const authors = authorConfig.map((author) => {
    return {
      name: author.name,
      email: author.email
    }
  })

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
    isbn: isEnabled('article-isbn', true) && page.data.isbnNumber
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
