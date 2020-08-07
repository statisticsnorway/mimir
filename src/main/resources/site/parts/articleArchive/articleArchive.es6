const {
  data
} = __non_webpack_require__('/lib/util')
const {
  getContent, imageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

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

  const title = page.displayName ? page.displayName : undefined

  const preambleText = page.data.preamble ? page.data.preamble : undefined
  const preambleObj = new React4xp('LeadParagraph')
    .setProps({
      children: preambleText
    })
    .setId('preamble')

  /* TODO: Image needs to rescale dynamically */
  const image = page.data.image ? imageUrl({
    id: page.data.image,
    scale: 'block(1200, 275)'
  }) : undefined
  const imageAltText = page.data.image ? getImageAlt(page.data.image) : ''

  const freeText = page.data.freeText ? processHtml({
    value: removeNonBreakingSpaceFor(page.data.freeText)
  }) : undefined

  const issnNumber = page.data.issnNumber ? page.data.issnNumber : undefined

  const model = {
    title,
    image,
    imageAltText,
    freeText,
    issnNumber
  }

  const isOutsideContentStudio = (
    req.mode === 'live' ||
      req.mode === 'preview'
  )

  const body = preambleObj.renderBody({
    body: render(view, model),
    clientRender: isOutsideContentStudio
  })
  const pageContributions = preambleObj.renderPageContributions({
    pageContributions: {},
    clientRender: isOutsideContentStudio
  })

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}

const removeNonBreakingSpaceFor = (htmlText) => {
  return htmlText.replace(/&nbsp;/g, ' ')
}
