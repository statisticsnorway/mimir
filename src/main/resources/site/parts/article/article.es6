const {
  getContent, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  data
} = __non_webpack_require__('/lib/util')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const moment = require('moment/min/moment-with-locales')
const languageLib = __non_webpack_require__( '/lib/language')
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
    value: page.data.articleText ? page.data.articleText.replace(/.&nbsp;/g, ' ') : undefined
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

  const externalLinkConfig = page.data.relatedExternalLinkItemSet ? data.forceArray(page.data.relatedExternalLinkItemSet) : []

  const model = {
    title: page.displayName,
    language: languageLib.getLanguage(page),
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    externalLinkConfig,
    serialNumber: page.data.serialNumber,
    introTitle: page.data.introTitle
  }

  let body = render(view, model)
  let pageContributions

  const divider = new React4xp('Divider').setId('dividerId')

  body = divider.renderBody({
    body
  })

  if (externalLinkConfig && externalLinkConfig.length) {
    const externalLinksComponent = new React4xp('Links')
      .setProps({
        links: externalLinkConfig.map((links) => {
          return {
            href: links.url,
            children: links.urlText,
            iconType: 'externalLink',
            isExternal: true
          }
        })
      })
      .setId('externalLinksId')

    body = externalLinksComponent.renderBody({
      body
    })
    pageContributions = externalLinksComponent.renderPageContributions()
  }

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}
