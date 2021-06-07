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
    return renderPart(req, part.config.factBox)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, id) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req, factBoxId) {
  // throw an error if there is no selected factbox, or an empty section for edit mode
  if (!factBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      throw new Error('Factbox - Missing Id')
    }
  }
  const factBoxContent = content.get({
    key: factBoxId
  })
  if (!factBoxContent) throw new Error(`FactBox with id ${factBoxId} doesn't exist`)
  const text = processHtml({
    value: factBoxContent.data.text.replace(/&nbsp;/g, ' ')
  })
  const factBox = new React4xp('FactBox')
    .setProps({
      header: factBoxContent.displayName,
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
