const {
  getComponent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const content = __non_webpack_require__('/lib/xp/content')

const view = resolve('./factBox.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    return renderPart(req, part.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, params) {
  try {
    return renderPart(params)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(config) {
  let title
  let text

  if (config.factBox) {
    const factBoxContent = content.get({
      key: config.factBox
    })
    title = factBoxContent.displayName
    text = processHtml({
      value: factBoxContent.data.text.replace(/&nbsp;/g, ' ')
    })
  } else {
    title = config.factBoxTitle ? config.factBoxTitle : 'Fyll ut tittel'
    text = config.factBoxText ? config.factBoxText : 'Fyll inn tekst til boksen'
  }

  return renderFactBox(title, text)
}

function renderFactBox(title, text) {
  const factBox = new React4xp('FactBox')
    .setProps({
      header: title,
      text
    })
    .setId('fact-box')
    .uniqueId()

  const body = render(view, {
    factBoxId: factBox.react4xpId
  })
  return {
    body: factBox.renderBody({
      body
    }),
    pageContributions: factBox.renderPageContributions()
  }
}
